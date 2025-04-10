import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/authContext";
import { getProperties, addToFavorites, removeFromFavorites, getUserFavorites } from "../../firebase/properties";
import Layout from '../layout';
import { 
  FiHeart, 
  FiSearch, 
  FiX, 
  FiMapPin, 
  FiHome, 
  FiDroplet, 
  FiDollarSign, 
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';

const PropertyCard = ({ 
  property, 
  onFavoriteToggle, 
  isFavorite, 
  isLoading,
  onClick
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
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(property.id, e);
        }}
        disabled={isLoading}
        className={`absolute top-2 right-2 z-10 p-2 rounded-full shadow-md transition-colors ${
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
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          </span>
        )}
      </button>

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
          {isFavorite && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              Favorited
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchQuery: '',
        propertyType: 'all',
        bedrooms: 'any',
        bathrooms: 'any',
    });
    const [sortOption, setSortOption] = useState('default');
    const [favorites, setFavorites] = useState([]);
    const [favoriteLoading, setFavoriteLoading] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [modalImageIndex, setModalImageIndex] = useState(0);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const props = await getProperties();
                setProperties(props);
                setFilteredProperties(props);
            } catch (error) {
                console.error("Error loading properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (currentUser) {
                try {
                    const favs = await getUserFavorites(currentUser.uid);
                    setFavorites(favs);
                } catch (error) {
                    console.error("Error loading favorites:", error);
                }
            }
        };
        fetchFavorites();
    }, [currentUser]);

    useEffect(() => {
        let results = [...properties];

        // Apply filters
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            results = results.filter(property => 
                property.title.toLowerCase().includes(query) || 
                property.address.toLowerCase().includes(query)
            );
        }

        if (filters.propertyType !== 'all') {
            results = results.filter(
                property => property.propertyType === filters.propertyType
            );
        }

        if (filters.bedrooms !== 'any') {
            results = results.filter(property => {
                if (filters.bedrooms === '6+') return property.bedrooms >= 6;
                return property.bedrooms === parseInt(filters.bedrooms);
            });
        }

        if (filters.bathrooms !== 'any') {
            results = results.filter(property => {
                if (filters.bathrooms === '5+') return property.bathrooms >= 5;
                return property.bathrooms === parseFloat(filters.bathrooms);
            });
        }

        // Apply sorting
        if (sortOption === 'price-low-high') {
            results.sort((a, b) => a.monthlyRent - b.monthlyRent);
        } else if (sortOption === 'price-high-low') {
            results.sort((a, b) => b.monthlyRent - a.monthlyRent);
        }

        setFilteredProperties(results);
    }, [filters, properties, sortOption]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const resetFilters = () => {
        setFilters({
            searchQuery: '',
            propertyType: 'all',
            bedrooms: 'any',
            bathrooms: 'any',
        });
        setSortOption('default');
    };

    const toggleFavorite = async (propertyId, e) => {
        if (e) e.stopPropagation();
        if (!currentUser) return;
        
        setFavoriteLoading(prev => ({ ...prev, [propertyId]: true }));
        
        try {
            if (favorites.includes(propertyId)) {
                await removeFromFavorites(propertyId, currentUser.uid);
                setFavorites(prev => prev.filter(id => id !== propertyId));
            } else {
                await addToFavorites(propertyId, currentUser.uid);
                setFavorites(prev => [...prev, propertyId]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setFavoriteLoading(prev => ({ ...prev, [propertyId]: false }));
        }
    };

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
        setModalImageIndex(0);
    };

    const closeModal = (e) => {
        if (e) e.stopPropagation();
        setSelectedProperty(null);
    };

    const handleModalNextImage = (e) => {
        e.stopPropagation();
        setModalImageIndex(prev => 
            prev === selectedProperty.images.length - 1 ? 0 : prev + 1
        );
    };

    const handleModalPrevImage = (e) => {
        e.stopPropagation();
        setModalImageIndex(prev => 
            prev === 0 ? selectedProperty.images.length - 1 : prev - 1
        );
    };

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (selectedProperty) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [selectedProperty]);

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-8">Available Properties</h2>

                {/* Filters container */}
                <div className="flex flex-wrap items-end gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                    {/* Search field */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="searchQuery"
                                placeholder="Search properties..."
                                value={filters.searchQuery}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Property Type */}
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <select
                            name="propertyType"
                            value={filters.propertyType}
                            onChange={handleFilterChange}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Types</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                        </select>
                    </div>

                    {/* Bedrooms */}
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <select
                            name="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleFilterChange}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="any">Any</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6+">6+</option>
                        </select>
                    </div>

                    {/* Bathrooms */}
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <select
                            name="bathrooms"
                            value={filters.bathrooms}
                            onChange={handleFilterChange}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="any">Any</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5+">5+</option>
                        </select>
                    </div>

                    {/* Sort by Price */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select
                            value={sortOption}
                            onChange={handleSortChange}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="default">Default</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div className="flex-1 min-w-[120px]">
                        <button
                            onClick={resetFilters}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Property Listings */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map(property => {
                                const isFavorite = favorites.includes(property.id);
                                const isLoading = favoriteLoading[property.id];
                                
                                return (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        isFavorite={isFavorite}
                                        isLoading={isLoading}
                                        onFavoriteToggle={toggleFavorite}
                                        onClick={() => handlePropertyClick(property)}
                                    />
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500">No properties found matching your criteria</p>
                                <button 
                                    onClick={resetFilters}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Property Details Modal */}
                {selectedProperty && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <div 
                            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                {/* Close button */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                    aria-label="Close"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>

                                {/* Favorite button */}
                                {currentUser && (
                                    <button
                                        onClick={(e) => toggleFavorite(selectedProperty.id, e)}
                                        disabled={favoriteLoading[selectedProperty.id]}
                                        className={`absolute top-4 left-4 z-20 p-2 rounded-full shadow-md transition-colors ${
                                            favorites.includes(selectedProperty.id)
                                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                        aria-label={favorites.includes(selectedProperty.id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <FiHeart 
                                            className="h-5 w-5" 
                                            fill={favorites.includes(selectedProperty.id) ? 'currentColor' : 'none'} 
                                        />
                                    </button>
                                )}

                                {/* Image Gallery with Arrows */}
                                <div className="relative h-64 md:h-80 bg-gray-100">
                                    {selectedProperty.images?.length > 0 ? (
                                        <>
                                            <img
                                                src={selectedProperty.images[modalImageIndex]}
                                                alt={`${selectedProperty.title} - ${modalImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-image.jpg';
                                                    e.target.className = 'w-full h-full object-contain p-4';
                                                }}
                                            />
                                            {/* Navigation Arrows */}
                                            {selectedProperty.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={handleModalPrevImage}
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                                        aria-label="Previous image"
                                                    >
                                                        <FiChevronLeft className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={handleModalNextImage}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                                        aria-label="Next image"
                                                    >
                                                        <FiChevronRight className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                            {/* Image Counter */}
                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
                                                {modalImageIndex + 1} / {selectedProperty.images.length}
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
                                            <h2 className="text-2xl font-bold">{selectedProperty.title}</h2>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <FiMapPin className="mr-1" />
                                                <span>{selectedProperty.address}</span>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold text-indigo-600">
                                            CAD {selectedProperty.monthlyRent?.toLocaleString()}/month
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 py-4 border-t border-b border-gray-200">
                                        <div className="flex items-center">
                                            <FiHome className="text-gray-500 mr-2" />
                                            <div>
                                                <div className="text-sm text-gray-500">Type</div>
                                                <div className="capitalize">{selectedProperty.propertyType}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-gray-500 mr-2">🛏️</div>
                                            <div>
                                                <div className="text-sm text-gray-500">Bedrooms</div>
                                                <div>{selectedProperty.bedrooms}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <FiDroplet className="text-gray-500 mr-2" />
                                            <div>
                                                <div className="text-sm text-gray-500">Bathrooms</div>
                                                <div>{selectedProperty.bathrooms}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <FiDollarSign className="text-gray-500 mr-2" />
                                            <div>
                                                <div className="text-sm text-gray-500">Rent</div>
                                                <div>CAD {selectedProperty.monthlyRent?.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {selectedProperty.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {/* Amenities */}
                                    {selectedProperty.amenities?.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProperty.amenities.map((amenity, index) => (
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
                                                {selectedProperty.ownerEmail?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium">{selectedProperty.ownerEmail}</div>
                                                <div className="text-sm text-gray-500">Property owner</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;