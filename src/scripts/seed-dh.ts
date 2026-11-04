/**
 * Seeds the DH proof of concept with real content from wearedh.com:
 *   - Homepage and What we do (page builder)
 *   - Friends for Life outreach + showcase projects (structured case studies)
 *   - Issues advocacy blog post (structured post)
 *   - Team page, 48 team members and Brie Adderley's full profile
 *   - Header, footer and site settings globals
 *
 * Safe to re-run: documents are matched by slug and updated in place, media by filename.
 *
 *   npm run seed:dh
 */
import { randomBytes } from 'crypto'
import path from 'path'
import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import teamData from './data/team.json'

const WP = 'https://wearedh.com/wp-content/uploads'
const context = { disableRevalidate: true }

// ---------- Lexical helpers ----------

type Node = Record<string, unknown>

const text = (value: string, format = 0): Node => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const link = (url: string, label: string): Node => ({
  type: 'link',
  children: [text(label)],
  direction: 'ltr',
  fields: { linkType: 'custom', newTab: false, url },
  format: '',
  indent: 0,
  version: 3,
})

const p = (...children: (string | Node)[]): Node => ({
  type: 'paragraph',
  children: children.map((c) => (typeof c === 'string' ? text(c) : c)),
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const h = (tag: 'h1' | 'h2' | 'h3' | 'h4', value: string): Node => ({
  type: 'heading',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

const mediaBlock = (media: number | string): Node => ({
  type: 'block',
  fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType: 'mediaBlock', media },
  format: '',
  version: 2,
})

const root = (...children: Node[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const paras = (...items: string[]) => root(...items.map((t) => p(t)))

// ---------- Upsert helpers ----------

const mediaCache = new Map<string, number | string>()

async function upload(payload: Payload, url: string, alt = ''): Promise<number | string> {
  const filename = path.basename(new URL(url).pathname)
  if (mediaCache.has(filename)) return mediaCache.get(filename)!

  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: { filename: { equals: filename } },
  })
  if (existing.docs[0]) {
    mediaCache.set(filename, existing.docs[0].id)
    return existing.docs[0].id
  }

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (DH Payload POC seed)' } })
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())

  const doc = await payload.create({
    collection: 'media',
    context,
    data: { alt },
    file: {
      data,
      mimetype: res.headers.get('content-type') || 'application/octet-stream',
      name: filename,
      size: data.length,
    },
  })
  payload.logger.info(`  ↳ media: ${filename}`)
  mediaCache.set(filename, doc.id)
  return doc.id
}

async function upsert<T extends 'pages' | 'posts' | 'projects' | 'team' | 'categories'>(
  payload: Payload,
  collection: T,
  slug: string,
  data: Record<string, unknown>,
): Promise<number | string> {
  const existing = await payload.find({
    collection,
    draft: true,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const withStatus = ['pages', 'posts', 'projects'].includes(collection)
    ? { ...data, slug, _status: 'published' }
    : { ...data, slug }

  if (existing.docs[0]) {
    const doc = await payload.update({
      collection,
      context,
      id: existing.docs[0].id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: withStatus as any,
    })
    payload.logger.info(`Updated ${collection}/${slug}`)
    return doc.id
  }

  const doc = await payload.create({
    collection,
    context,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: withStatus as any,
  })
  payload.logger.info(`Created ${collection}/${slug}`)
  return doc.id
}

const customLink = (label: string, url: string, appearance = 'default') => ({
  link: { type: 'custom', appearance, label, url, newTab: false },
})

const refLink = (
  label: string,
  relationTo: 'pages' | 'posts' | 'projects',
  value: number | string,
  appearance = 'default',
) => ({
  link: { type: 'reference', appearance, label, reference: { relationTo, value }, newTab: false },
})

// ---------- Seed ----------

async function seed() {
  const payload = await getPayload({ config })

  // Taxonomy + people
  payload.logger.info('— Categories and team')
  const pointOfView = await upsert(payload, 'categories', 'point-of-view', {
    title: 'Point of View',
  })
  const featured = await upsert(payload, 'categories', 'featured', { title: 'Featured' })

  // Card-level data for everyone, scraped from wearedh.com/team
  const teamIds: Record<string, number | string> = {}
  for (const member of teamData) {
    teamIds[member.slug] = await upsert(payload, 'team', member.slug, {
      name: member.name,
      role: member.role,
      departments: member.departments,
      headshot: await upload(payload, member.headshot, member.name),
    })
  }

  // One full profile to show the structured profile fields
  const brie = await upsert(payload, 'team', 'brie-adderley', {
    bio: 'Brie is a seasoned communicator, writer and project manager with more than a decade of experience overseeing complex projects in many sectors, from health care to government to higher education. Brie has developed and implemented several complex PR and public affairs programs and is an expert in strategy development, stakeholder engagement, and policy and budget analysis.',
    traits: ['Communications strategist', 'Equity advocate', 'Outdoor enthusiast'],
    story: root(
      h('h4', 'Meeting clients’ needs.'),
      p(
        'No matter how complicated a project might be, Brie says it’s all about the personal touch. Her job is to not only provide DH clients with communications counsel and tactical oversight, but to build a custom plan around their end goals and to figure out how all those pieces come together. Finding the exact right language to tell a story and convey our clients’ point of view is, she says, both a science and an art.',
      ),
      p(
        '“I really love that combination,” Brie says. “That’s one of the things I love most about my position — being able to jump from one topic to the next, to dive into a new subject and get familiar with it, then provide best possible counsel to the client.”',
      ),
      h('h4', 'The importance of DEI.'),
      p(
        'Much of Brie’s work is driven by her personal desire for equity, justice and a commitment to learning. She co-leads our agency’s DEI initiatives, which include a new culturally inclusive style guide, and she sees plenty of overlap in DH’s commitment to this work and the ways in which we collaborate with clients and communities.',
      ),
      h('h4', 'An active lifestyle.'),
      p(
        'Brie played basketball in college, and she still finds herself channeling that competitive spirit, particularly when it comes to challenging herself in work and in life. She’s always looking for an opportunity to be outdoors, whether it involves hiking or mountain biking, and she’s traveled everywhere from London to Belize to Spain to India. When she isn’t outside, you can find her selling her handmade paper crafts and greeting cards on Etsy.',
      ),
    ),
    quote:
      'My interest and passion stems from a life of volunteerism and activism, and I see DEI as a key part of that. I want to ensure that DEI isn’t just something you work on when you have time or check off a list. It should be intentionally woven into everything you do as a company — as counselors to clients and as human beings.',
    education: [
      {
        credential: 'Certificate, DEI in the workplace',
        school: 'University of South Florida, Muma College of Business',
      },
      { credential: 'MA, Public Administration', school: 'The George Washington University' },
      { credential: 'BA, Politics and Government', school: 'University of Puget Sound' },
    ],
    involvement: [
      { item: 'Leadership Tomorrow cohort member, class of 2023' },
      { item: 'Seattle Metropolitan Chamber of Commerce equity committee member 2020-present' },
      { item: 'Greenwood Community Council board member 2017-2022' },
      { item: 'IPREX DEI committee member 2020-present' },
    ],
  })

  // ----- Projects -----
  payload.logger.info('— Projects')

  const fflOutreach = await upsert(payload, 'projects', 'friends-for-life-outreach', {
    title: 'Friends for Life outreach',
    client: 'Washington State Health Care Authority',
    heroImage: await upload(
      payload,
      `${WP}/2026/09/Friends-For-Life-Mural_Header-image.webp`,
      'Colorful mural on a white exterior wall depicting a diverse group gathered around tote bag with naloxone in it, with a parked car partially blocking the lower-right corner.',
    ),
    industries: ['Public health', 'Behavioral health'],
    services: [
      'Media buying',
      'Messaging',
      'Co-creation',
      'Community partnerships',
      'Social-change marketing',
    ],
    practiceAreas: ['social-change', 'advertising'],
    headline: 'Meeting youth at high risk where they already are.',
    challenge: paras(
      'Friends for Life is a fentanyl- and naloxone-education campaign. It provides different information for people with different experiences, including primary-prevention and harm-reduction messages. But some young people who face a higher risk of opioid overdose didn’t fit neatly into our Friends for Life outreach.',
      'Prevention materials shared by schools and coalitions weren’t reaching them. Neither were harm reduction materials delivered through syringe service programs and local health jurisdictions. Our challenge was to find ways to bridge the gap where these young people were being missed.',
    ),
    insight: paras(
      'For young people ages 14 to 25 in these “bridge” populations, we learned the most effective messages landed somewhere between prevention and harm reduction, whether the young people personally used substances or not.',
      'And where to reach them mattered as much as what to say. Out-of-home media in places like bars, raves, downtown sidewalks and shelters gave us better access than classroom or health spaces could.',
    ),
    solution: paras(
      'Our media team explored unconventional options. Posters and other print materials went out to youth-serving shelters. Bars, live-music venues and traveling raves used branded wrist bands, bar coasters and announcements between sets to give attendees information about the campaign and naloxone. On social media, we partnered with a Seattle-based rave influencer and co-designers across the state to make on-trend, educational content. We also made a lo-fi zine for young people without good internet access. In Spokane, young artists helped us paint a public mural downtown.',
    ),
    results: paras(
      'Click-through rates on co-designed videos consistently outperformed platform averages. Our influencer partnership drove 2.1 million impressions, and venue partnerships put naloxone information in front of roughly 4,000 eventgoers across Seattle and Spokane. Posters reached shelters statewide, and over 20,000 passersby see the mural in Spokane each week.',
      'These reach numbers are impressive. But we also measure campaign success by how it affects people’s lives. A staffer at one venue partner said, “Just a week after we partnered with Friends for Life … a patron became unconscious.” The staffer administered naloxone and credited the partnership and campaign information for helping them feel prepared.',
    ),
    teaser:
      'See how Friends for Life reached high-risk youth and young adults with an unconventional media buy.',
    teaserMedia: await upload(
      payload,
      `${WP}/2026/09/FFL_Mural.gif`,
      'Friends for Life mural animation',
    ),
    publishedAt: '2026-09-15T12:00:00.000Z',
    meta: {
      title: 'Friends for Life outreach',
      description:
        'How Friends for Life reached high-risk youth and young adults with an unconventional media buy.',
    },
  })

  // Gallery needs uploads resolved in order, so it is written in a second pass
  const galleryItems = []
  for (const [file, alt, width] of [
    [
      'Open-Keep-Your-Circle-Safe-Zine.webp',
      'Open illustrated overdose prevention zine on concrete explaining how opioid overdose affects friends and families and how small steps can help protect loved ones.',
      'half',
    ],
    [
      'Keep-Your-Circle-Safe-zine-on-Orange-Chair.webp',
      '“Keep Your Circle Safe” fentanyl-safety zine resting on a bright orange chair, with illustrated hands beneath a rainbow on the cover.',
      'half',
    ],
    [
      'How-To-Talk-About-Fentanyl-Guide-Held-in-Hand.webp',
      'A hand holds a booklet titled “I’m here for you: How to talk to a friend about fentanyl” against a dark background.',
      'half',
    ],
    [
      'Community-Mural-on-City-Wall.webp',
      'Colorful public mural of a diverse group sitting together in grass around tote bag with naloxone, with squirrels nearby, painted on a white city wall.',
      'half',
    ],
    [
      'Friends-For-Life-Venue-Wristbands-and-Hand-Gesture.webp',
      'Close-up of two forearms under red lighting wearing Friends for Life event wristbands, with one hand making a ‘rock on’ gesture.',
      'half',
    ],
    [
      'Overdose-Prevention-Poster-in-Mirror.webp',
      'Overdose-prevention poster taped to a mirror beside a camera-flash reflection. Its central message reads, “Everyone deserves to live, and anyone can be a friend for life.”',
      'half',
    ],
    [
      'Friends-for-LIfe-Posters-Inside-Train.webp',
      'Bright interior of a light-rail car covered with colorful Friends for Life overdose-prevention posters on the doors, walls, and ceiling.',
      'full',
    ],
    [
      'FOL-Youth-Poster-Mockup_C-flattened-2.jpg',
      'Brick transit station with a column wrapped in a Friends for Life naloxone campaign and additional colorful safety posters above a row of benches.',
      'half',
    ],
    [
      'Naloxone-Poster-Above-Train-Seats.webp',
      'Naloxone safety poster above blue train seats reading, “Keep your friends safe. Carry naloxone (Narcan),” alongside illustrated hands.',
      'half',
    ],
    ['video:https://player.vimeo.com/video/1231437059?h=51e5bd2461', '', 'full'],
    [
      'Naloxone-Stickers-on-Street-Pole.webp',
      'Two green-and-white overdose-prevention stickers on a metal street pole reading “Friends for Life” and “I Carry Naloxone,” with a residential street blurred behind them.',
      'half',
    ],
    [
      'Naloxone-Stickers-on-Bottle-in-Grass.webp',
      'Clear water bottle with a blue cap lying in sunlit grass, decorated with “Friends for Life” and “I Carry Naloxone” stickers.',
      'half',
    ],
  ]) {
    galleryItems.push(
      file.startsWith('video:')
        ? { type: 'video', width, videoUrl: file.slice('video:'.length) }
        : { type: 'image', width, media: await upload(payload, `${WP}/2026/09/${file}`, alt) },
    )
  }
  await payload.update({
    collection: 'projects',
    context,
    id: fflOutreach,
    data: { gallery: galleryItems as never, _status: 'published' },
  })

  // Spotlight projects (homepage). Only listing-card content is migrated for these in the POC.
  const ffl = await upsert(
    payload,
    'projects',
    'friends-for-life-washington-state-health-care-authority',
    {
      title: 'Friends for Life',
      client: 'Washington State Health Care Authority',
      heroImage: await upload(
        payload,
        `${WP}/2024/05/Friends-for-Life-Naloxone.gif`,
        'Friends For Life',
      ),
      teaserMedia: await upload(
        payload,
        `${WP}/2024/05/Friends-for-Life-Naloxone.gif`,
        'Friends For Life',
      ),
      logo: await upload(
        payload,
        `${WP}/2024/05/FFL_Green_Blue__2C_CMYK.png`,
        'Friends for Life logo',
      ),
      teaser:
        'By leading with care and connection, this campaign helps people throughout Washington prevent fentanyl overdoses. We partnered with our client, the Washington State Health Care Authority, to create an education campaign that presents hopeful, helpful actions everyone could take to help save lives.',
      practiceAreas: ['social-change', 'advertising', 'digital'],
      industries: ['Public health'],
      publishedAt: '2024-05-01T12:00:00.000Z',
    },
  )

  const alaska = await upsert(payload, 'projects', 'alaska-airlines', {
    title: 'Alaska Airlines',
    client: 'Alaska Airlines',
    heroImage: await upload(
      payload,
      `${WP}/2024/05/Kids_Exiting_Alaskan_Airlines_Plane.jpg`,
      'Kids exiting an Alaska Airlines plane',
    ),
    teaserMedia: await upload(
      payload,
      `${WP}/2024/05/Alaska-Airlines-Community-engagement-Ambassadors-Program.jpg`,
      'Alaska Airlines community engagement ambassadors program',
    ),
    teaser:
      'Alaska’s Seattle connection may be its most important. To help tell its story to its hometown, the airline has been calling on its DH partners since 2016. We’re helping Alaska build stronger ties and more meaningful engagement in Seattle.',
    practiceAreas: ['pr'],
    industries: ['Transportation'],
    publishedAt: '2024-05-01T12:00:00.000Z',
  })

  // Grid projects (homepage "work" grid). Listing-card content only.
  const gridSeed: [string, string, string, string, string[]][] = [
    [
      'for-our-lives-youth-campaign',
      'For Our Lives youth campaign',
      '2026/09/FOL_Interview.gif',
      'Media co-created with Native young people, and the adults who support them, helped our client deliver overdose-prevention information to a generation that values realness, flaws and all.',
      ['social-change'],
    ],
    // NOTE: the live site shows the New Jersey Capital Access Fund copy on this card; flagged for content review
    [
      'long-covid-awareness',
      'Long COVID awareness',
      '2026/09/DOH_Long-COVID.gif',
      'Busy small-business owners have specific lending needs. This small-business loan program’s marketing strategy grew out of the wants and needs of the New Jersey companies it meant to serve — starting with simplicity above all.',
      ['social-change', 'digital'],
    ],
    [
      'new-jersey-capital-access-fund',
      'New Jersey Capital Access Fund',
      '2026/03/NJCAF_Teaser-animation_640x360-optimized.gif',
      'Busy small-business owners have specific lending needs. This small-business loan program’s marketing strategy grew out of the wants and needs of the New Jersey companies it meant to serve — starting with simplicity above all.',
      ['advertising', 'branding'],
    ],
    [
      'charlotte-small-business-growth-fund',
      'Charlotte Small Business Growth Fund',
      '2025/09/CSBGF_Gif.gif',
      'Applications from small businesses took off in Charlotte, N.C., for this equity-driven loan program, thanks to a digital campaign built on real-life stories.',
      ['digital', 'advertising'],
    ],
    [
      'open-arms-for-canada',
      'Helping Seattle businesses embrace Canadian visitors',
      '2025/08/Thumbnail-Gif.gif',
      'The Open Arms for Canada project offers Canadian visitors an antidote to the cynicism coming from the other Washington.',
      ['pr', 'branding'],
    ],
    [
      'washington-traffic-safety-commission',
      'Washington Traffic Safety Commission',
      '2025/06/V3_WYS_ENGLISH_30-SEC-low.gif',
      'To reduce DUIs and alcohol-related crashes in Washington, this multicultural marketing campaign encourages people from diverse backgrounds to plan for safe rides home.',
      ['advertising', 'social-change'],
    ],
    [
      'grow-america',
      'Grow America',
      '2025/02/Teaser-Animated.gif',
      'This CDFI wanted to demystify the loan process for business owners in BIPOC and low-income communities. Animated videos use plain language and storytelling to shed light on lending.',
      ['digital', 'branding'],
    ],
    [
      'university-of-oregon',
      'University of Oregon',
      '2024/08/university-oregon-featured.gif',
      'Out-of-state students told their own success stories to demonstrate the value of a UO education.',
      ['advertising'],
    ],
  ]

  const gridIds: (number | string)[] = [fflOutreach]
  for (const [i, [slug, title, gif, teaser, practiceAreas]] of gridSeed.entries()) {
    const media = await upload(payload, `${WP}/${gif}`, title)
    gridIds.push(
      await upsert(payload, 'projects', slug, {
        title,
        heroImage: media,
        teaserMedia: media,
        teaser,
        practiceAreas,
        // Keep the live site's order when sorting by date
        publishedAt: new Date(Date.UTC(2026, 7, 30 - i)).toISOString(),
      }),
    )
  }

  // ----- Posts -----
  payload.logger.info('— Posts')

  const trustImg = await upload(
    payload,
    `${WP}/2026/08/trustrelationshipillustration.png`,
    'Illustration of trust and relationships',
  )
  const researchImg = await upload(
    payload,
    `${WP}/2026/08/researchillustration.png`,
    'Illustration of research',
  )
  const brickImg = await upload(
    payload,
    `${WP}/2026/08/issuesadvocacy_bricklayerillustration.jpg`,
    'Illustration of a bricklayer',
  )
  const windowImg = await upload(
    payload,
    `${WP}/2026/08/issuesadvocacy_windowillustration.jpg`,
    'Illustration of neighbors at windows',
  )

  const aiPost = await upsert(payload, 'posts', 'ai-for-social-good-means-leading-with-humanity', {
    title: 'AI for social good means leading with humanity.',
    excerpt:
      'For social impact and communications leaders, our job is to harness AI to best serve people.',
    content: root(
      p(
        'Placeholder for the POC. Read the original at ',
        link('https://wearedh.com/ai-for-social-good-means-leading-with-humanity/', 'wearedh.com'),
        '.',
      ),
    ),
    categories: [pointOfView],
    publishedAt: '2026-03-10T12:00:00.000Z',
  })

  const trustPost = await upsert(
    payload,
    'posts',
    'building-the-trust-that-makes-change-possible-issues-advocacy-at-dh',
    {
      title: 'Building the trust that makes change possible: Issues advocacy at DH.',
      excerpt:
        'Public trust provides a solid foundation for policy, community and institutional change. Here’s how and why.',
      heroImage: await upload(
        payload,
        `${WP}/2026/08/illustrationfinalv3.jpg`,
        'Illustration of neighbors leaning out the windows of a blue brick building while workers haul and lay bricks to extend the wall.',
      ),
      lead: 'Real change is built on a solid foundation. Relationships and trust go in first — the ask comes much later.',
      byline: [brie],
      featured: true,
      categories: [pointOfView, featured],
      relatedPosts: [aiPost],
      publishedAt: '2026-08-25T12:00:00.000Z',
      content: root(
        p(
          'Many organizations and leaders who care deeply about an issue have a clear sense of what they want to make happen. Whether that’s championing new legislation or building support for an initiative, they know what needs to change.',
        ),
        p('They’re less sure how to create the public conditions that make change possible.'),
        p(
          'That’s the work of issues advocacy, a public affairs practice at DH. We help shape public understanding and trust so that policy, community or institutional change becomes possible. Issues advocacy sits upstream of direct lobbying, campaign consulting or policy development, and is the connective tissue between public perception and policy outcomes that a lot of organizations are missing.',
        ),
        h('h2', 'Start with trust and relationship building.'),
        mediaBlock(trustImg),
        p(
          'Trust is not a byproduct of advocacy, but the prerequisite. Build it first, and your message has somewhere to land. Skip it, and even a good message reads as noise, or worse, as disingenuous.',
        ),
        p(
          'We see many organizations leading with the ask, but the more effective approach is to invest in relationships long before you need to activate them as champions. In practice, that means showing up at community meetings, connecting with civic and government partners, and engaging with influencers across sectors consistently — not just when an issue is hot.',
        ),
        p(
          'Durable, cross-sector relationships give you a running start when an issue arises. DH has spent years building a partner network in Seattle and across Washington state because we know trust is an asset that outlasts any single campaign, decision or funding cycle.',
        ),
        h('h2', 'Know who you’re reaching.'),
        mediaBlock(researchImg),
        p(
          'Before you can build community support, you have to understand who your community actually is.',
        ),
        p(
          link(
            'https://wearedh.com/assumptions-are-expensive-why-data-driven-communications-includes-investing-in-research/',
            'For that, you need to do your research',
          ),
          ' — and here’s a crucial element that’s often overlooked. Research isn’t a preliminary phase that ends when advocacy begins. It’s an ongoing strategic input that shapes the work as it unfolds.',
        ),
        p(
          'That means understanding not just who holds power, but who holds influence and who’s most affected by the change you want to make. Relationship mapping, audience analyses, message testing, and readiness assessments all serve one purpose: centering the voices of the people an issue impacts, not just the loudest or best-organized. Campaigns built on assumptions fail. Campaigns built on genuine understanding of community needs, values and information succeed.',
        ),
        h('h2', 'Build support before you make the ask.'),
        mediaBlock(brickImg),
        p(
          'The ask — a policy vote, a funding decision or community approval — is a culminating moment, not a starting point. Important legwork must come first. That includes narrative development, stakeholder and community engagement, coalition building, and demonstrated alignment between an organization’s goals and a community’s priorities.',
        ),
        p(
          'When public support is real and visible, it gives decision-makers the cover and confidence to act. When it’s absent, opposition can fill the vacuum. The absence of a trusted narrative is an open invitation for competing ones. The most convincing proof here is any organization that earned community confidence before a major decision could move forward. The Seattle Convention Center expansion project is a ',
          link(
            'https://wearedh.com/project/supporting-seattles-new-convention-center/',
            'great example',
          ),
          '.',
        ),
        h('h2', 'The work doesn’t end with the win.'),
        mediaBlock(windowImg),
        p(
          'Advocacy isn’t a campaign with a finish line. The issues that shape strong, healthy communities — infrastructure, education, healthcare access, economic development, environmental policy — have long-term impacts, and engagement has to match that longevity. Decisions made today shape conditions for years.',
        ),
        p(
          'That’s why what happens after a win matters as much as the win itself. Communities that feel genuinely engaged become durable allies, whereas communities that feel used or tokenized become skeptics. Staying credible — not just momentarily persuasive — means continued presence at civic events, a narrative strategy that evolves as conditions change, and responding when the political environment shifts. Organizations that sustain that credibility don’t start from zero when the next challenge or opportunity arrives.',
        ),
        h('h2', 'What this means for your organization.'),
        p(
          'The through line is simple: Build trust, then knowledge, then support, and then sustain the engagement. Each step makes the next possible, and trust is your most durable asset.',
        ),
        p(
          'If you’re facing a complex issue, a fast-moving policy environment, or a funding ask with community implications, issues advocacy helps you navigate it with integrity and effectiveness.',
        ),
      ),
      meta: {
        title: 'Building the trust that makes change possible: Issues advocacy at DH',
        description:
          'Public trust provides a solid foundation for policy, community and institutional change. Here’s how and why.',
      },
    },
  )
  void trustPost

  // ----- Pages -----
  payload.logger.info('— Pages')

  const contact = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { slug: { equals: 'contact' } },
  })
  const contactId = contact.docs[0]?.id

  const teamPage = await upsert(payload, 'pages', 'team', {
    title: 'Team',
    hero: {
      type: 'dhStatement',
      richText: root(
        h('h1', 'Smart people. Good humans.'),
        h(
          'h4',
          'Our team includes leaders, experts and relationship-builders who are invested and connected across the Pacific Northwest and beyond.',
        ),
      ),
      media: await upload(payload, `${WP}/2024/05/DH_Office_WhatWeDo_Hero4.jpg`, 'DH office'),
      links: [],
    },
    layout: [{ blockType: 'teamGrid', showFilters: true, theme: 'dark' }],
    meta: {
      title: 'Team',
      description: 'Smart people. Good humans. Meet the DH team.',
    },
  })

  const whatWeDo = await upsert(payload, 'pages', 'what-we-do', {
    title: 'What we do',
    hero: {
      type: 'dhStatement',
      richText: root(
        h('h1', 'DH brings strategy & clarity to complicated problems.'),
        h(
          'h4',
          'Our collaborative approach is dynamic by design. We bring together people, creativity and process.',
        ),
        p(
          'Our experienced, multidisciplinary team is deeply invested and connected. We use creative, advertising, digital, multimedia, public relations and social change expertise to advance your success.',
        ),
      ),
      media: await upload(
        payload,
        `${WP}/2024/05/Equity-diversity-inclusion-fuel-us-and-our-work_MOBILE.jpg`,
        'DH office',
      ),
      links: [],
    },
    layout: [
      {
        blockType: 'valueStack',
        theme: 'light',
        items: [
          {
            heading: 'Our team becomes a part of yours.',
            body: 'We are your strategic communications and marketing partners. We work as an extension of your team, helping you navigate challenges and uncover opportunities that lead to meaningful change.',
          },
          {
            heading: 'We create space for collaboration.',
            body: 'Our planning process facilitates agreement early and often. Our “roadmapping” process engages everyone from the start for efficiency and the strongest ideas. And we bring your leaders, audience members and other stakeholders together sooner to share their perspectives and influence outcomes.',
          },
          {
            heading: 'We make the work feel different.',
            body: 'The DH team operates with candor and kindness, wit and concern. We are transparent and accessible, and we care about our clients and their audiences. We are here to change the world.',
          },
        ],
      },
      {
        blockType: 'servicesList',
        heading: 'Our communications services',
        theme: 'dark',
        groups: [
          {
            title: 'Public relations & advocacy',
            services: [
              'Communications strategy',
              'Stakeholder engagement',
              'Community engagement',
              'Content strategy',
              'Thought leadership',
              'Coalition building',
              'Corporate communications',
              'Crisis communications',
              'Reputation management',
              'Media relations and training',
              'Public education',
              'Public advocacy',
              'Communications interventions',
              'Quantitative research',
              'Qualitative research',
              'Focus groups and surveys',
            ],
          },
          {
            title: 'Branding & identity',
            services: [
              'Brand implementation',
              'Brand messaging',
              'Brand strategy',
              'Logo development',
              'Naming',
              'Mission, vision, values',
              'Visual identity',
              'Brand platforms',
            ],
          },
          {
            title: 'Social change marketing',
            services: [
              'Strengths-based campaigns',
              'Behavior change',
              'Community engagement',
              'Positive community norming',
              'Prevention education',
              'Harm reduction education',
            ],
          },
          {
            title: 'Digital',
            services: [
              'Content strategy',
              'Analytics and reporting',
              'Digital strategy',
              'Email marketing',
              'Social media strategy',
              'Community management',
              'Search engine marketing (SEM)',
              'Search engine optimization (SEO)',
              'User experience (UX)',
              'Information architecture',
              'Mobile-first website design',
              'Mobile-first website development',
              'Digital experience consulting',
            ],
          },
          {
            title: 'Advertising',
            services: [
              'Traditional media buying (television, radio, print, and outdoor (OOH))',
              'Digital channel media buying (contextual, programmatic, websites, social media, streaming services (OTT), and apps)',
              'B2B and B2C marketing',
              'Creative strategy',
              'Marketing research',
              'Media planning',
              'Multimedia production',
              'Video production',
              'Radio production',
              'Environmental marketing',
              'Campaign measurement',
            ],
          },
        ],
      },
    ],
    meta: {
      title: 'What we do',
      description: 'DH brings strategy and clarity to complicated problems.',
    },
  })

  await upsert(payload, 'pages', 'home', {
    title: 'Home',
    hero: {
      type: 'dhVideo',
      eyebrow: 'We help clients create positive change.',
      richText: root(
        h(
          'h1',
          'DH is a social impact agency. We use communication and creative strategy to build stronger organizations and communities.',
        ),
      ),
      videoUrl: 'https://player.vimeo.com/video/1028212454?h=2488eae733',
      links: [],
    },
    layout: [
      {
        blockType: 'splitFeature',
        heading: 'Equity always.',
        body: 'DH centers equity in every aspect of the work — because we know those most affected by an issue are also closest to the solution.',
        links: [customLink('Equity at DH', '/equity')],
        mediaType: 'video',
        videoUrl: 'https://vimeo.com/835534926',
        mediaPosition: 'right',
        theme: 'light',
      },
      {
        blockType: 'projectShowcase',
        layout: 'spotlight',
        populateBy: 'selection',
        projects: [ffl, alaska],
        theme: 'dark',
      },
      {
        blockType: 'projectShowcase',
        layout: 'grid',
        populateBy: 'selection',
        projects: gridIds,
        showFilterLinks: true,
        theme: 'dark',
      },
      {
        blockType: 'statement',
        headline: 'Our roots are in Seattle & Spokane.',
        secondaryHeadline: 'Our connections extend far beyond.',
        body: 'DH builds tailored, integrated communications programs to engage audiences and reach communities. We draw on strong relationships with partners throughout the region, U.S. and world.',
        links: [refLink('What we do', 'pages', whatWeDo)],
        theme: 'lavender',
      },
      {
        blockType: 'archive',
        introContent: root(h('h2', 'News & ideas.')),
        populateBy: 'collection',
        relationTo: 'posts',
        categories: [pointOfView],
        limit: 2,
        links: [customLink('Read more', '/posts')],
        theme: 'light',
      },
      {
        blockType: 'cta',
        richText: root(h('h2', 'Ready to drive change together?')),
        links: [
          contactId
            ? refLink('Let’s talk', 'pages', contactId)
            : customLink('Let’s talk', '/contact'),
        ],
        theme: 'lavender',
      },
    ],
    meta: {
      title: 'We are DH: Social impact agency in Seattle and Spokane, Washington',
      description:
        'DH is a social impact agency. We use communication and creative strategy to build stronger organizations and communities.',
    },
  })

  // ----- Globals -----
  payload.logger.info('— Header and footer')

  await payload.updateGlobal({
    slug: 'header',
    context,
    data: {
      navItems: [
        customLink('Work', '/work'),
        refLink('What we do', 'pages', whatWeDo),
        customLink('Equity', '/equity'),
        refLink('Team', 'pages', teamPage),
        customLink('News', '/posts'),
        contactId ? refLink('Contact', 'pages', contactId) : customLink('Contact', '/contact'),
      ] as never,
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context,
    data: {
      navItems: [
        customLink('News', '/posts'),
        customLink('Careers', '/careers'),
        contactId ? refLink('Contact', 'pages', contactId) : customLink('Contact', '/contact'),
      ] as never,
    },
  })

  payload.logger.info('— Site settings')

  await payload.updateGlobal({
    slug: 'site-settings',
    context,
    data: {
      siteName: 'DH',
      tagline: 'Branding, advertising, digital, public relations, social change',
      defaultDescription:
        'DH is a social impact agency. We use communication and creative strategy to build stronger organizations and communities.',
      defaultImage: (await upload(payload, `${WP}/2024/05/DH_Office_WhatWeDo_Hero4.jpg`, 'DH office')) as number,
      email: 'welcome@wearedh.com',
      locations: [
        { city: 'Seattle', phone: '+1 206 323 3733' },
        { city: 'Spokane', phone: '+1 509 444 2350' },
      ],
      social: [
        { label: 'Facebook', url: 'https://www.facebook.com/desautelhege' },
        { label: 'Instagram', url: 'https://www.instagram.com/wearedh/' },
        {
          label: 'LinkedIn',
          url: 'https://www.linkedin.com/company/desautel-hege-communications/',
        },
        { label: 'Vimeo', url: 'https://vimeo.com/wearedh' },
      ],
      announcement: { enabled: false },
    },
  })

  payload.logger.info('✓ DH seed complete')
}

await seed()
process.exit(0)
