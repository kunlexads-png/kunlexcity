import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Convert Prisma Decimal values into numbers for frontend compatibility.
const formatProperty = (property: any) => ({
  ...property,
  price: Number(property.price),
  propertySize: Number(property.propertySize),
  landSize: property.landSize === null ? undefined : Number(property.landSize),
});

// Record activities in the PostgreSQL AuditLog table.
const logActivity = async (
  userId: string | undefined,
  userName: string | undefined,
  action: string,
  details: string
) => {
  await prisma.auditLog.create({
    data: {
      userId: userId || null,
      userName: userName || null,
      action,
      details,
    },
  });
};

// GET ALL PROPERTIES
export const getProperties = async (req: Request, res: Response) => {
  try {
    const {
      search,
      location,
      category,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      status,
      approvalStatus = 'APPROVED',
      sort = 'newest',
      page = '1',
      limit = '9',
      all,
    } = req.query as Record<string, string>;

    // Read property records from PostgreSQL.
    let list = await prisma.property.findMany();

    if (all !== 'true') {
      list = list.filter((p) => p.approvalStatus === approvalStatus);
    }

    if (status) {
      list = list.filter((p) => p.status === status);
    }

    if (listingType && listingType !== 'ALL') {
      list = list.filter(
        (p) => p.listingType.toUpperCase() === listingType.toUpperCase()
      );
    }

    if (category && category !== 'ALL') {
      list = list.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (location && location !== 'ALL') {
      const loc = location.toLowerCase();

      list = list.filter(
        (p) =>
          p.area.toLowerCase().includes(loc) ||
          p.city.toLowerCase().includes(loc) ||
          p.state.toLowerCase().includes(loc) ||
          p.address.toLowerCase().includes(loc)
      );
    }

    if (search) {
      const q = search.toLowerCase();

      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      list = list.filter((p) => Number(p.price) >= parseFloat(minPrice));
    }

    if (maxPrice) {
      list = list.filter((p) => Number(p.price) <= parseFloat(maxPrice));
    }

    if (bedrooms && bedrooms !== 'ANY') {
      list = list.filter((p) => p.bedrooms >= parseInt(bedrooms, 10));
    }

    if (bathrooms && bathrooms !== 'ANY') {
      list = list.filter((p) => p.bathrooms >= parseInt(bathrooms, 10));
    }

    // Sorting
    if (sort === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'size-desc') {
      list.sort(
        (a, b) => Number(b.propertySize) - Number(a.propertySize)
      );
    } else if (sort === 'views-desc') {
      list.sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      list.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }

    const totalCount = list.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const startIndex = (pageNum - 1) * limitNum;

    const paginatedList = list
      .slice(startIndex, startIndex + limitNum)
      .map(formatProperty);

    return res.json({
      success: true,
      data: paginatedList,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve properties',
    });
  }
};

// GET ONE PROPERTY BY ID OR SLUG
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const existingProperty = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Increment views directly in PostgreSQL.
    const property = await prisma.property.update({
      where: { id: existingProperty.id },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    const similar = await prisma.property.findMany({
      where: {
        id: { not: property.id },
        approvalStatus: 'APPROVED',
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: {
        ...formatProperty(property),
        similarProperties: similar.map(formatProperty),
      },
    });
  } catch (error) {
    console.error('Error fetching property:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve property',
    });
  }
};

// ONLY ADMIN CAN CREATE PROPERTY
export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrator can publish properties.',
      });
    }

    const {
      title,
      description,
      category = 'Luxury Villa',
      listingType = 'SALE',
      price,
      state = 'Lagos',
      city = 'Lagos',
      area,
      address,
      bedrooms = 3,
      bathrooms = 3,
      toilets = 4,
      parkingSpaces = 2,
      propertySize = 400,
      landSize,
      amenities = [],
      images = [],
    } = req.body;

    if (!title || !description || !price || !area || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required property details.',
      });
    }

    const slug =
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    const defaultImages =
      Array.isArray(images) && images.length > 0
        ? images
        : [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          ];

    const newProperty = await prisma.property.create({
      data: {
        title: String(title),
        description: String(description),
        category: String(category),
        listingType,
        price: Number(price),
        currency: 'NGN',
        country: 'Nigeria',
        state: String(state),
        city: String(city),
        area: String(area),
        address: String(address),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        toilets: Number(toilets),
        parkingSpaces: Number(parkingSpaces),
        propertySize: Number(propertySize),
        landSize: landSize ? Number(landSize) : null,
        amenities: Array.isArray(amenities) ? amenities : [],
        images: defaultImages,
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: false,
        viewsCount: 0,
        slug,
      },
    });

    await logActivity(
      user.id,
      user.name,
      'PROPERTY_CREATED',
      `Admin uploaded property "${newProperty.title}" (${newProperty.id})`
    );

    return res.status(201).json({
      success: true,
      message: 'Property uploaded and published to PrimeNest Realty successfully!',
      data: formatProperty(newProperty),
    });
  } catch (error) {
    console.error('Error creating property:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create property',
    });
  }
};

// UPDATE PROPERTY
export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrator can edit properties.',
      });
    }

    const id = String(req.params.id);
    const body = req.body;

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Only allow fields belonging to the Property model.
    const allowedFields = [
      'title',
      'description',
      'category',
      'listingType',
      'price',
      'currency',
      'country',
      'state',
      'city',
      'area',
      'address',
      'bedrooms',
      'bathrooms',
      'toilets',
      'parkingSpaces',
      'propertySize',
      'landSize',
      'amenities',
      'images',
      'status',
      'approvalStatus',
      'featured',
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const numericFields = [
      'price',
      'propertySize',
      'bedrooms',
      'bathrooms',
      'toilets',
      'parkingSpaces',
    ];

    for (const field of numericFields) {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]);
      }
    }

    if (updateData.landSize !== undefined) {
      updateData.landSize =
        updateData.landSize === null || updateData.landSize === ''
          ? null
          : Number(updateData.landSize);
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.user.id,
      req.user.name,
      'PROPERTY_UPDATED',
      `Admin updated property ${property.id}`
    );

    return res.json({
      success: true,
      message: 'Property updated successfully',
      data: formatProperty(property),
    });
  } catch (error) {
    console.error('Error updating property:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update property',
    });
  }
};

// DELETE PROPERTY
export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrator can delete properties.',
      });
    }

    const id = String(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    await prisma.property.delete({
      where: { id },
    });

    await logActivity(
      req.user.id,
      req.user.name,
      'PROPERTY_DELETED',
      `Admin deleted property ${property.title}`
    );

    return res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete property. Check whether related records prevent deletion.',
    });
  }
};

// UPDATE PROPERTY STATUS
export const updatePropertyStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrator can update property status.',
      });
    }

    const id = String(req.params.id);
    const { approvalStatus, status, featured } = req.body;

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const updateData: Record<string, any> = {};

    if (approvalStatus !== undefined) {
      updateData.approvalStatus = approvalStatus;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (typeof featured === 'boolean') {
      updateData.featured = featured;
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.user.id,
      req.user.name,
      'PROPERTY_STATUS_CHANGE',
      `Updated status of ${property.title} to ${status || approvalStatus || 'unchanged'}`
    );

    return res.json({
      success: true,
      message: 'Status updated',
      data: formatProperty(property),
    });
  } catch (error) {
    console.error('Error updating property status:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update property status',
    });
  }
};

// TOGGLE FAVOURITE
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to save properties.',
      });
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const existing = await prisma.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      },
    });

    if (existing) {
      await prisma.favourite.delete({
        where: { id: existing.id },
      });

      return res.json({
        success: true,
        isFavorite: false,
        message: 'Removed from saved properties',
      });
    }

    await prisma.favourite.create({
      data: {
        userId,
        propertyId: id,
      },
    });

    return res.json({
      success: true,
      isFavorite: true,
      message: 'Saved to your favourites',
    });
  } catch (error) {
    console.error('Error toggling favourite:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update saved properties',
    });
  }
};

// GET AUTHENTICATED USER FAVOURITES
export const getUserFavorites = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to view saved properties.',
      });
    }

    const favourites = await prisma.favourite.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    const properties = favourites.map((favourite) =>
      formatProperty(favourite.property)
    );

    return res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching favourites:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved properties',
    });
  }
};
