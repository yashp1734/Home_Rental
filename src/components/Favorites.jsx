import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { getFavoriteProperties, removeFromFavorites } from "../firebase/properties";
import PropertyCard from "./PropertyCard";
import PropertyDetailsModal from "./PropertyDetailsModal";
import Layout from './layout';
import { FiHeart } from 'react-icons/fi';

const Favorites = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favoriteLoading, setFavoriteLoading] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadFavorites = async () => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const favoriteProperties = await getFavoriteProperties(currentUser.uid);
            setProperties(favoriteProperties);
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError(err.message || 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, [currentUser]);

    const toggleFavorite = async (propertyId, e) => {
        if (!currentUser) return;
        
        setFavoriteLoading(prev => ({ ...prev, [propertyId]: true }));
        
        try {
            await removeFromFavorites(propertyId, currentUser.uid);
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            setSelectedProperty(null);
        } catch (error) {
            console.error("Error removing favorite:", error);
        } finally {
            setFavoriteLoading(prev => ({ ...prev, [propertyId]: false }));
        }
    };

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
        setCurrentImageIndex(0);
    };

    const closeModal = () => {
        setSelectedProperty(null);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => 
            prev === selectedProperty.images.length - 1 ? 0 : prev + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => 
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

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-md mx-auto mt-10 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                    <p className="mb-3">{error}</p>
                    <button 
                        onClick={loadFavorites}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Favorite Properties</h1>

                {properties.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No favorite properties</h3>
                        <p className="mt-1 text-gray-500">You haven't marked any properties as favorites yet.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/home')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Browse Properties
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property}
                                isFavorite={true}
                                isLoading={favoriteLoading[property.id]}
                                showFavoriteButton={true}
                                showDeleteButton={false}
                                showEditButton={false}
                                onFavoriteToggle={toggleFavorite}
                                onClick={() => handlePropertyClick(property)}
                            />
                        ))}
                    </div>
                )}

                {/* Property Details Modal */}
                {selectedProperty && (
                    <PropertyDetailsModal
                        property={selectedProperty}
                        isFavorite={true}
                        isLoading={favoriteLoading[selectedProperty.id]}
                        onClose={closeModal}
                        onFavoriteToggle={toggleFavorite}
                        currentImageIndex={currentImageIndex}
                        onNextImage={handleNextImage}
                        onPrevImage={handlePrevImage}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Favorites;