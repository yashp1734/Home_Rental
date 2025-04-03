import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiHeart, FiChevronLeft, FiChevronRight, FiTrash2, FiEdit } from 'react-icons/fi';

const PropertyCard = ({ 
  property, 
  isFavorite = false,
  isLoading = false,
  showFavoriteButton = true,
  showDeleteButton = false,
  showEditButton = false,
  onFavoriteToggle = () => {},
  onDelete = () => {},
  onEdit = () => {},
  onClick = () => {}
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"
      onClick={onClick}
    >
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        {showFavoriteButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(property.id, e);
            }}
            disabled={isLoading}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiHeart 
              className="h-5 w-5" 
              fill={isFavorite ? 'currentColor' : 'none'} 
            />
          </button>
        )}
        
        {showEditButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-md"
            aria-label="Edit property"
          >
            <FiEdit className="h-5 w-5" />
          </button>
        )}
        
        {showDeleteButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 shadow-md"
            aria-label="Delete property"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Image Gallery with Arrows */}
      <div className="relative h-48 overflow-hidden">
        {property.images?.length > 0 ? (
          <>
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
                e.target.className = 'w-full h-full object-contain bg-gray-100 p-2';
              }}
            />
            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                  aria-label="Next image"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            {/* Image Counter */}
            {property.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 px-2 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded-full">
                {currentImageIndex + 1}/{property.images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-500">No Images Available</span>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{property.title}</h3>
        <p className="text-gray-600 text-sm mb-2 truncate">{property.address}</p>
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 font-bold">
            CAD {property.monthlyRent?.toLocaleString()}/month
          </span>
          <span className="text-sm text-gray-500">
            {property.bedrooms} bed • {property.bathrooms} bath
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-500 capitalize">
            {property.propertyType}
          </span>
          {isFavorite && showFavoriteButton && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              Favorited
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    monthlyRent: PropTypes.number.isRequired,
    bedrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    bathrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    propertyType: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    ownerEmail: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isFavorite: PropTypes.bool,
  isLoading: PropTypes.bool,
  showFavoriteButton: PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  showEditButton: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onClick: PropTypes.func,
};

PropertyCard.defaultProps = {
  isFavorite: false,
  isLoading: false,
  showFavoriteButton: true,
  showDeleteButton: false,
  showEditButton: false,
  onFavoriteToggle: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onClick: () => {},
};

export default PropertyCard;