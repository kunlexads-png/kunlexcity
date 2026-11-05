
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../db/prisma.js';
import { Prisma } from '@prisma/client';

type PropertyRecord = Prisma.PropertyGetPayload<Record<string, never>>;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return null;

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

async function getActiveProperties(): Promise<PropertyRecord[]> {
  return prisma.property.findMany({
    where: {
      approvalStatus: 'APPROVED',
      status: {
        in: ['AVAILABLE', 'UNDER_OFFER'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

function getGroundedContext(properties: PropertyRecord[]): string {
  const activeProperties = properties.filter(
    (property) =>
      property.approvalStatus === 'APPROVED' &&
      property.status === 'AVAILABLE'
  );

  const listingsSummary = activeProperties
    .map(
      (p) =>
        `- ID: "${p.id}", Title: "${p.title}", Type: "${p.listingType}", Category: "${p.category}", Price: ₦${Number(p.price).toLocaleString()} ${p.listingType === 'RENT' ? '/year' : ''}, Location: "${p.area}, ${p.city}, ${p.state}", Beds: ${p.bedrooms}, Baths: ${p.bathrooms}, Size: ${Number(p.propertySize)} sqm, Amenities: [${p.amenities.join(', ')}]`
    )
    .join('\n');

  return `Current Live Properties in Database:\n${listingsSummary}`;
}

function extractBudget(
  query: string
): { min?: number; max?: number; isRent?: boolean } {
  const q = query.toLowerCase();

  const isRent =
    q.includes('rent') ||
    q.includes('lease') ||
    q.includes('/year') ||
    q.includes('per year');

  const rangeMatch = q.match(
    /(\d+(?:\.\d+)?)\s*(?:m|million)?\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:m|million)/i
  );

  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]) * 1000000,
      max: Number(rangeMatch[2]) * 1000000,
      isRent,
    };
  }

  const billionMatch = q.match(
    /(?:under|below|less than|max|budget(?: of)?|upto|up to)?\s*₦?\s*(\d+(?:\.\d+)?)\s*(?:b|billion)/i
  );

  if (billionMatch) {
    return {
      max: Number(billionMatch[1]) * 1000000000,
      isRent,
    };
  }

  const millionMatch = q.match(
    /(?:under|below|less than|max|budget(?: of)?|upto|up to)?\s*₦?\s*(\d+(?:\.\d+)?)\s*(?:m|million)/i
  );

  if (millionMatch) {
    return {
      max: Number(millionMatch[1]) * 1000000,
      isRent,
    };
  }

  return { isRent };
}

function getLocalExpertResponse(
  userQuery: string,
  properties: PropertyRecord[]
): { reply: string; recommendedPropertyIds: string[] } {
  const q = userQuery.toLowerCase();
  const budget = extractBudget(q);

  let activeProps = properties.filter(
    (p) =>
      p.approvalStatus === 'APPROVED' &&
      (p.status === 'AVAILABLE' || p.status === 'UNDER_OFFER')
  );

  if (budget.isRent || q.includes('rent') || q.includes('lease')) {
    const rentProps = activeProps.filter(
      (p) => p.listingType === 'RENT' || p.listingType === 'LEASE'
    );

    if (rentProps.length > 0) activeProps = rentProps;
  } else if (
    q.includes('buy') ||
    q.includes('sale') ||
    q.includes('purchase')
  ) {
    const saleProps = activeProps.filter(
      (p) => p.listingType === 'SALE'
    );

    if (saleProps.length > 0) activeProps = saleProps;
  }

  if (budget.max !== undefined) {
    const budgetFiltered = activeProps.filter(
      (p) => Number(p.price) <= budget.max! * 1.15
    );

    if (budgetFiltered.length > 0) activeProps = budgetFiltered;
  }

  if (budget.min !== undefined) {
    const budgetFiltered = activeProps.filter(
      (p) => Number(p.price) >= budget.min! * 0.85
    );

    if (budgetFiltered.length > 0) activeProps = budgetFiltered;
  }

  const locations = [
    { key: 'banana island', area: 'banana island' },
    { key: 'ikoyi', area: 'ikoyi' },
    { key: 'lekki', area: 'lekki' },
    { key: 'victoria island', area: 'victoria island' },
    { key: 'vi', area: 'victoria island' },
    { key: 'eko atlantic', area: 'eko atlantic' },
    { key: 'ikeja', area: 'ikeja' },
    { key: 'maitama', area: 'maitama' },
    { key: 'guzape', area: 'guzape' },
    { key: 'abuja', area: 'abuja' },
    { key: 'port harcourt', area: 'port harcourt' },
    { key: 'old gra', area: 'old gra' },
  ];

  const matchedLocation = locations.find((l) => q.includes(l.key));

  if (matchedLocation) {
    const locFiltered = activeProps.filter(
      (p) =>
        p.area.toLowerCase().includes(matchedLocation.area) ||
        p.city.toLowerCase().includes(matchedLocation.area) ||
        p.state.toLowerCase().includes(matchedLocation.area)
    );

    if (locFiltered.length > 0) activeProps = locFiltered;
  }

  if (q.includes('pool') || q.includes('swimming')) {
    const poolFiltered = activeProps.filter(
      (p) =>
        p.amenities.some((a) => a.toLowerCase().includes('pool')) ||
        p.description.toLowerCase().includes('pool')
    );

    if (poolFiltered.length > 0) activeProps = poolFiltered;
  }

  if (
    q.includes('waterfront') ||
    q.includes('lagoon') ||
    q.includes('ocean') ||
    q.includes('sea') ||
    q.includes('marina')
  ) {
    const waterFiltered = activeProps.filter(
      (p) =>
        p.amenities.some(
          (a) =>
            a.toLowerCase().includes('water') ||
            a.toLowerCase().includes('lagoon') ||
            a.toLowerCase().includes('ocean') ||
            a.toLowerCase().includes('marina')
        ) ||
        p.title.toLowerCase().includes('waterfront') ||
        p.title.toLowerCase().includes('oceanfront') ||
        p.title.toLowerCase().includes('marina')
    );

    if (waterFiltered.length > 0) activeProps = waterFiltered;
  }

  if (q.includes('cinema')) {
    const cinemaFiltered = activeProps.filter((p) =>
      p.amenities.some((a) => a.toLowerCase().includes('cinema'))
    );

    if (cinemaFiltered.length > 0) activeProps = cinemaFiltered;
  }

  const topMatches = activeProps.slice(0, 3);
  const recIds = topMatches.map((p) => p.id);

  let advice = '';

  if (matchedLocation) {
    switch (matchedLocation.area) {
      case 'banana island':
        advice += `📍 **Banana Island Advisory**: Banana Island is Nigeria's most secure and affluent residential enclave. Properties benefit from 24/7 dedicated private power grids, gated biometric entry, and private lagoon access for yachting. High capital appreciation with prices typically ranging from ₦1.5B to ₦3.5B+.\n\n`;
        break;

      case 'ikoyi':
        advice += `📍 **Ikoyi Advisory**: Ikoyi represents colonial heritage merged with ultra-modern luxury. Popular for diplomatic residences, corporate headquarters, and multi-level terraces with full Governor’s Consent titles. Average luxury terraces range between ₦250M – ₦500M.\n\n`;
        break;

      case 'lekki':
        advice += `📍 **Lekki Phase 1 Advisory**: Lekki Phase 1 is Lagos' premier commercial-residential lifestyle corridor. High demand, vibrant culinary and social scene along Admiralty Way, and impressive rental yields of 8%–11%. High-end 5-bedroom smart detached duplexes range from ₦380M to ₦600M.\n\n`;
        break;

      case 'victoria island':
      case 'eko atlantic':
        advice += `📍 **Victoria Island & Eko Atlantic Advisory**: The central business district and oceanfront haven. Features the Great Wall of Lagos ensuring zero flood risk, independent clean power and water infrastructure, and panoramic Atlantic views. Prime executive penthouses rent between ₦25M – ₦50M/year.\n\n`;
        break;

      case 'maitama':
      case 'guzape':
      case 'abuja':
        advice += `📍 **Abuja Diplomatic & Hillside Advisory**: Maitama and Guzape provide unmatched prestige, sweeping Aso Rock vistas, ambassadorial security, and low-density layouts. Mansions here range from ₦600M to over ₦1.5B with clean C of O titles.\n\n`;
        break;

      case 'port harcourt':
      case 'old gra':
        advice += `📍 **Old GRA Port Harcourt Advisory**: The most distinguished executive enclave in the Garden City, favored by multinational energy leadership, offering expansive private plots and serene compound living.\n\n`;
        break;
    }
  }

  if (budget.max !== undefined) {
    const formattedBudget = `₦${(
      budget.max / 1000000
    ).toLocaleString()}M`;

    advice += `💰 **Budget Analysis**: For a budget of ${formattedBudget}, our portfolio offers available options. Please verify title documentation and applicable acquisition fees with your solicitor.\n\n`;
  }

  advice += `✨ **Selected Properties for You**:\n`;

  topMatches.forEach((p, idx) => {
    const price = Number(p.price);

    const priceStr =
      price >= 1000000000
        ? `₦${(price / 1000000000).toFixed(2)} Billion`
        : `₦${(price / 1000000).toFixed(0)} Million`;

    const rentSuffix = p.listingType === 'RENT' ? '/year' : '';

    advice += `${idx + 1}. **${p.title}**\n   • Location: ${p.area}, ${p.city}\n   • Price: ${priceStr}${rentSuffix}\n   • Specs: ${p.bedrooms} Beds, ${p.bathrooms} Baths, ${Number(p.propertySize)} sqm\n   • Highlights: ${p.amenities.slice(0, 3).join(', ')}\n\n`;
  });

  if (topMatches.length === 0) {
    advice += 'I could not find an approved listing matching those preferences in the current database. Please try a different budget or location.\n\n';
  }

  advice += `Would you like to schedule a private in-person inspection, take a virtual walkthrough, or review property documents with our KunlexCity advisors?`;

  return {
    reply: advice,
    recommendedPropertyIds: recIds,
  };
}

export async function askPrimeNestAI(
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'model'; parts: string }> = []
): Promise<{ reply: string; recommendedPropertyIds?: string[] }> {
  const properties = await getActiveProperties();
  const client = getAIClient();
  const groundedData = getGroundedContext(properties);

  const systemInstruction = `You are PrimeNest AI, the senior luxury real estate advisor for KunlexCity / PrimeNest Realty in Nigeria.

YOUR MISSION:
Deliver authoritative, refined, and responsive real estate advice covering:
1. Properties: use only actual properties in the live database below. Never invent properties, prices, addresses or specifications.
2. Budget: quote prices in Nigerian Naira and explain what the live portfolio offers.
3. Locations: discuss the requested neighbourhood, but distinguish general area knowledge from verified property facts.

CRITICAL RULES:
1. ONLY recommend properties that exist in the live database provided below.
2. NEVER invent fake properties, prices, addresses or property specifications.
3. If the user's preferences do not match the live listings, explain that honestly.
4. Append a final line listing recommended property IDs:
"RECOMMENDED_IDS: prop-xxx, prop-yyy"

DATABASE STATE:
${groundedData}`;

  if (!client) {
    return getLocalExpertResponse(userQuery, properties);
  }

  try {
    const formattedHistory = chatHistory
      .map((item) => `${item.role}: ${item.parts}`)
      .join('\n');

    const prompt = `${formattedHistory ? formattedHistory + '\n' : ''}user: ${userQuery}\nmodel:`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || '';

    if (!reply) {
      return getLocalExpertResponse(userQuery, properties);
    }

    const idMatch = reply.match(/RECOMMENDED_IDS:\s*([^\n\r]+)/i);

    let recommendedPropertyIds: string[] = [];
    let cleanReply = reply;

    if (idMatch && idMatch[1]) {
      const requestedIds = idMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/['"`]/g, ''));

      recommendedPropertyIds = properties
        .filter(
          (property) =>
            property.approvalStatus === 'APPROVED' &&
            property.status === 'AVAILABLE' &&
            requestedIds.includes(property.id)
        )
        .map((property) => property.id);

      cleanReply = reply
        .replace(/RECOMMENDED_IDS:\s*([^\n\r]+)/i, '')
        .trim();
    }

    if (recommendedPropertyIds.length === 0) {
      const mentioned = properties.filter(
        (property) =>
          property.approvalStatus === 'APPROVED' &&
          property.status === 'AVAILABLE' &&
          (cleanReply.toLowerCase().includes(property.title.toLowerCase()) ||
            cleanReply.toLowerCase().includes(property.id.toLowerCase()))
      );

      if (mentioned.length > 0) {
        recommendedPropertyIds = mentioned.map((p) => p.id);
      } else {
        const heuristic = getLocalExpertResponse(userQuery, properties);
        recommendedPropertyIds = heuristic.recommendedPropertyIds;
      }
    }

    return {
      reply: cleanReply,
      recommendedPropertyIds,
    };
  } catch (error) {
    console.error(
      'Gemini API Error (falling back to expert heuristic):',
      error
    );

    return getLocalExpertResponse(userQuery, properties);
  }
}

export async function generatePropertyDescription(specs: {
  title: string;
  category: string;
  listingType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  amenities: string[];
}): Promise<string> {
  const client = getAIClient();

  if (!client) {
    return `An exquisite ${specs.bedrooms}-bedroom ${specs.category} located in the prestigious neighborhood of ${specs.location}. Designed for modern luxury living, this residence boasts ${specs.bathrooms} en-suite bathrooms, generous living spaces, and top-tier amenities including ${specs.amenities.join(', ')}. Ideal for discerning buyers seeking security, elegance, and solid capital appreciation.`;
  }

  try {
    const prompt = `Write an eloquent, high-converting, professional luxury real estate listing description for:
Property Title: ${specs.title}
Category: ${specs.category}
Listing Type: ${specs.listingType}
Location: ${specs.location}
Bedrooms: ${specs.bedrooms}
Bathrooms: ${specs.bathrooms}
Price: ₦${specs.price.toLocaleString()}
Key Amenities: ${specs.amenities.join(', ')}

Tone: Sophisticated and professional. Do not invent property features beyond the supplied information. Keep it between 120 and 180 words.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return (
      response.text ||
      'Exceptional residence with premium fittings and a prime location.'
    );
  } catch (error) {
    console.error('Gemini error generating description:', error);

    return `A distinguished ${specs.bedrooms}-bedroom ${specs.category} in ${specs.location}, featuring ${specs.bathrooms} bathrooms and amenities including ${specs.amenities.join(', ')}.`;
  }
}

export async function comparePropertiesWithAI(
  propertyIds: string[]
): Promise<string> {
  const matched = await prisma.property.findMany({
    where: {
      id: { in: propertyIds },
    },
  });

  if (matched.length < 2) {
    return 'Please select at least two valid properties to compare.';
  }

  const client = getAIClient();

  const summary = matched
    .map(
      (p) =>
        `Property: "${p.title}"\n- Price: ₦${Number(p.price).toLocaleString()}\n- Location: ${p.area}, ${p.city}\n- Type: ${p.listingType} (${p.category})\n- Beds/Baths: ${p.bedrooms}B / ${p.bathrooms}B\n- Size: ${Number(p.propertySize)} sqm\n- Amenities: ${p.amenities.join(', ')}`
    )
    .join('\n\n');

  if (!client) {
    return `Comparison Summary:\n${matched
      .map(
        (p) =>
          `• ${p.title} offers ${p.bedrooms} bedrooms in ${p.area} for ₦${Number(p.price).toLocaleString()}`
      )
      .join('\n')}\n\nCompare the verified specifications and confirm property titles before making a decision.`;
  }

  try {
    const prompt = `Act as an expert real estate investment analyst at KunlexCity PrimeNest Realty.

Provide an objective comparative evaluation of these database properties:

${summary}

Highlight:
1. Value per square meter and price competitiveness.
2. Lifestyle and location advantages.
3. Rental yield and capital appreciation potential, clearly identifying estimates.
4. Final recommendation based on different buyer profiles.

Use only the specifications provided. Do not invent features, title documents, rental yields or other facts. Format with clear markdown headings and bullet points.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Comparison details generated.';
  } catch (error) {
    console.error('Gemini comparison error:', error);

    return 'Comparison analysis temporarily unavailable. Please review the side-by-side specifications.';
  }
}

  