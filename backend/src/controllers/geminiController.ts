
import { Request, Response } from 'express';
import {
  askPrimeNestAI,
  generatePropertyDescription,
  comparePropertiesWithAI,
} from '../services/geminiService.js';
import { prisma } from '../db/prisma.js';

export const handleAIChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const { reply, recommendedPropertyIds } = await askPrimeNestAI(
      message,
      Array.isArray(history) ? history : []
    );

    const recommendedProperties = recommendedPropertyIds?.length
      ? await prisma.property.findMany({
          where: {
            id: { in: recommendedPropertyIds },
          },
        })
      : [];

    return res.json({
      success: true,
      data: {
        reply,
        recommendedProperties,
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to process AI response',
    });
  }
};

export const handleGenerateDescription = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      category,
      listingType,
      location,
      bedrooms,
      bathrooms,
      price,
      amenities,
    } = req.body;

    const description = await generatePropertyDescription({
      title: title || 'Luxury Property',
      category: category || 'Villa',
      listingType: listingType || 'Sale',
      location: location || 'Ikoyi, Lagos',
      bedrooms: Number(bedrooms) || 4,
      bathrooms: Number(bathrooms) || 4,
      price: Number(price) || 200000000,
      amenities: Array.isArray(amenities)
        ? amenities
        : ['24/7 Power', 'Swimming Pool', 'Security'],
    });

    return res.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error('Error generating description:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate property description',
    });
  }
};

export const handleCompareProperties = async (
  req: Request,
  res: Response
) => {
  try {
    const { propertyIds } = req.body;

    if (
      !Array.isArray(propertyIds) ||
      propertyIds.length < 2 ||
      !propertyIds.every((id) => typeof id === 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 property IDs to compare.',
      });
    }

    const uniquePropertyIds = [...new Set(propertyIds)];

    const properties = await prisma.property.findMany({
      where: {
        id: { in: uniquePropertyIds },
      },
    });

    if (properties.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'At least 2 valid properties are required for comparison.',
      });
    }

    const analysis = await comparePropertiesWithAI(uniquePropertyIds);

    return res.json({
      success: true,
      data: {
        analysis,
        properties,
      },
    });
  } catch (error) {
    console.error('Error in property comparison:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to compare properties',
    });
  }
};
