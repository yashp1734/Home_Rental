import React from 'react';
import { 
  FiX, 
  FiHeart, 
  FiMapPin, 
  FiHome, 
  FiDroplet, 
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const PropertyDetailsModal = ({ 
  property, 
  isFavorite,
  isLoading,
  onClose,
  onFavoriteToggle,
  currentImageIndex,
  onNextImage,
  onPrevImage
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(property.id, e);
            }}
            disabled={isLoading}
            className={`absolute top-4 left-4 z-20 p-2 rounded-full shadow-md transition-colors ${
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

          {/* Image Gallery with Arrows */}
          <div className="relative h-64 md:h-80 bg-gray-100">
            {property.images?.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                    e.target.className = 'w-full h-full object-contain p-4';
                  }}
                />
                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrevImage();
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNextImage();
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      aria-label="Next image"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No Images Available</span>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{property.title}</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <FiMapPin className="mr-1" />
                  <span>{property.address}</span>
                </div>
              </div>
              <div className="text-xl font-bold text-indigo-600">
                CAD {property.monthlyRent?.toLocaleString()}/month
              </div>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 py-4 border-t border-b border-gray-200">
              <div className="flex items-center">
                <FiHome className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="capitalize">{property.propertyType}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-gray-500 mr-2">🛏️</div>
                <div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                  <div>{property.bedrooms}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FiDroplet className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                  <div>{property.bathrooms}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FiDollarSign className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Rent</div>
                  <div>CAD {property.monthlyRent?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {property.description || 'No description provided.'}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact/Lister Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Listed by</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {property.ownerEmail?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{property.ownerEmail}</div>
                  <div className="text-sm text-gray-500">Property owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;