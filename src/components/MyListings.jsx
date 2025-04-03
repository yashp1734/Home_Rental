import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { getUserProperties, deleteProperty, getFavoriteProperties,removeFromFavorites,addToFavorites } from "../firebase/properties";
import PropertyCard from "./PropertyCard";
import PropertyDetailsModal from "./PropertyDetailsModal";
import Layout from './layout';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FiPlus } from 'react-icons/fi';

const MyListings = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [favoriteLoading, setFavoriteLoading] = useState({});
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadProperties = async () => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const userProperties = await getUserProperties(currentUser.uid);
            const favs = await getFavoriteProperties(currentUser.uid);
            
            if (!userProperties) {
                throw new Error('No properties found');
            }
            
            setProperties(userProperties);
            setFavorites(favs.map(p => p.id));
        } catch (err) {
            console.error('Error loading properties:', err);
            setError(err.message || 'Failed to load your listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, [currentUser]);

    const handleCreateNew = () => {
        navigate('/list-property');
    };

    const handleDeleteProperty = async (propertyId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to permanently delete this property?',
            buttons: [
                {
                    label: 'Delete',
                    className: 'bg-red-500 hover:bg-red-600 text-white',
                    onClick: async () => {
                        try {
                            await deleteProperty(propertyId);
                            setProperties(prev => prev.filter(p => p.id !== propertyId));
                            setSelectedProperty(null);
                        } catch (error) {
                            console.error("Delete error:", error);
                            setError('Failed to delete property. Please try again.');
                        }
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {}
                }
            ]
        });
    };

    const toggleFavorite = async (propertyId, e) => {
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

    const handleEditProperty = (propertyId) => {
        navigate(`/edit-property/${propertyId}`);
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
                        onClick={loadProperties}
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
                    >
                        <FiPlus className="mr-2" />
                        Add New Property
                    </button>
                </div>

                {properties.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No properties listed</h3>
                        <p className="mt-1 text-gray-500">Get started by listing your first property.</p>
                        <div className="mt-6">
                            <button
                                onClick={handleCreateNew}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                List Property
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property}
                                isFavorite={favorites.includes(property.id)}
                                isLoading={favoriteLoading[property.id]}
                                showFavoriteButton={true}
                                showDeleteButton={true}
                                showEditButton={true}
                                onFavoriteToggle={toggleFavorite}
                                onDelete={() => handleDeleteProperty(property.id)}
                                onEdit={() => handleEditProperty(property.id)}
                                onClick={() => handlePropertyClick(property)}
                            />
                        ))}
                    </div>
                )}

                {/* Property Details Modal */}
                {selectedProperty && (
                    <PropertyDetailsModal
                        property={selectedProperty}
                        isFavorite={favorites.includes(selectedProperty.id)}
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

export default MyListings;