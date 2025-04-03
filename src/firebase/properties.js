import { db } from "./firebase";
import { ref, set, push, get, query, orderByChild,equalTo} from "firebase/database";

export const uploadProperty = async (propertyData, userId, userEmail) => {
    try {
        // Validate images array
        if (!propertyData.images || !Array.isArray(propertyData.images)) {
            throw new Error('Images must be provided as an array');
        }

        // maximum 4 images
        if (propertyData.images.length > 4) {
            throw new Error('Maximum of 4 images allowed');
        }

        // Image storing in string format ( Base 64 )
        const validImages = propertyData.images.filter(img => 
            typeof img === 'string' && img.startsWith('data:image')
        );

        if (validImages.length !== propertyData.images.length) {
            throw new Error('All images must be valid Base64 strings');
        }

        const newPropertyRef = push(ref(db, 'properties'));
        
        const propertyToSave = {
            title: propertyData.title,
            description: propertyData.description,
            address: propertyData.address,
            monthlyRent: propertyData.monthlyRent,
            propertyType: propertyData.propertyType,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            amenities: propertyData.amenities.split(',').map(item => item.trim()).filter(item => item),
            images: validImages.slice(0, 4), // Ensure max 4 images
            ownerId: userId,
            ownerEmail: userEmail,
            createdAt: new Date().toISOString(),
            isAvailable: true
        };

        await set(newPropertyRef, propertyToSave);
        return newPropertyRef.key;
    } catch (error) {
        console.error("Error saving property:", error);
        throw error;
    }
};

export const getProperties = async () => {
    try {
        const snapshot = await get(ref(db, 'properties'));
        if (snapshot.exists()) {
            return Object.entries(snapshot.val()).map(([id, data]) => ({
                id,
                ...data,
                // Ensure images array exists
                images: data.images || []
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
    }
};

export const getUserProperties = async (userId) => {
    try {
        const snapshot = await get(query(ref(db, 'properties'), orderByChild('ownerId'), equalTo(userId)));
        if (snapshot.exists()) {
            return Object.entries(snapshot.val()).map(([id, data]) => ({
                id,
                ...data
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching user properties:", error);
        throw error;
    }
};

export const deleteProperty = async (propertyId) => {
    try {
        await set(ref(db, `properties/${propertyId}`), null);
        return true;
    } catch (error) {
        console.error("Error deleting property:", error);
        throw error;
    }
};

export const addToFavorites = async (propertyId, userId) => {
    try {
      await set(ref(db, `favorites/${userId}/${propertyId}`), true);
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  };
  
  export const removeFromFavorites = async (propertyId, userId) => {
    try {
      await set(ref(db, `favorites/${userId}/${propertyId}`), null);
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  };
  
  export const getUserFavorites = async (userId) => {
    try {
      const snapshot = await get(ref(db, `favorites/${userId}`));
      if (snapshot.exists()) {
        return Object.keys(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      throw error;
    }
  };
  
  export const getFavoriteProperties = async (userId) => {
    try {
      const favoriteIds = await getUserFavorites(userId);
      if (favoriteIds.length === 0) return [];
      
      const properties = await getProperties();
      return properties.filter(property => favoriteIds.includes(property.id));
    } catch (error) {
      console.error("Error fetching favorite properties:", error);
      throw error;
    }
  };

  export const getPropertyById = async (propertyId) => {
    try {
      const snapshot = await get(ref(db, `properties/${propertyId}`));
      if (snapshot.exists()) {
        return { id: propertyId, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching property:", error);
      throw error;
    }
  };

  export const updateProperty = async (propertyId, updates) => {
    try {
        // Validate property ID
        if (!propertyId) {
            throw new Error('Property ID is required');
        }

        // Get the existing property to merge with updates
        const existingProperty = await getPropertyById(propertyId);
        if (!existingProperty) {
            throw new Error('Property not found');
        }

        // Prepare the update data
        const updatedData = {
            ...existingProperty,
            ...updates,
            // Ensure these fields are properly formatted
            amenities: Array.isArray(updates.amenities) 
                ? updates.amenities 
                : (updates.amenities || '').split(',').map(item => item.trim()).filter(item => item),
            monthlyRent: Number(updates.monthlyRent) || 0,
            bedrooms: Number(updates.bedrooms) || 1,
            bathrooms: Number(updates.bathrooms) || 1,
            // Don't overwrite these fields if not provided in updates
            ownerId: updates.ownerId || existingProperty.ownerId,
            ownerEmail: updates.ownerEmail || existingProperty.ownerEmail,
            // Update the timestamp
            updatedAt: new Date().toISOString()
        };

        // Validate images
        if (updatedData.images && Array.isArray(updatedData.images)) {
            if (updatedData.images.length > 4) {
                throw new Error('Maximum of 4 images allowed');
            }
            
            // Filter out any invalid image strings
            updatedData.images = updatedData.images.filter(img => 
                typeof img === 'string' && (img.startsWith('data:image') || img.startsWith('http'))
            );
        } else {
            // Ensure images array exists
            updatedData.images = existingProperty.images || [];
        }

        // Update the property in the database
        await set(ref(db, `properties/${propertyId}`), updatedData);
        
    } catch (error) {
        console.error("Error updating property:", error);
        throw error;
    }
};