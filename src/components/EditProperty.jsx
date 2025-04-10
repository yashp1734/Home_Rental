import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../contexts/authContext';
import { getPropertyById, updateProperty } from '../firebase/properties';
import Layout from './layout';
import { FiHome, FiUpload, FiX, FiTrash2 } from 'react-icons/fi';

const EditProperty = () => {
    const { propertyId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [propertyData, setPropertyData] = useState({
        title: '',
        description: '',
        address: '',
        monthlyRent: '',
        propertyType: 'apartment',
        bedrooms: '1',
        bathrooms: '1',
        amenities: '',
        images: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const property = await getPropertyById(propertyId);
                
                if (!property) {
                    throw new Error('Property not found');
                }
                
                if (property.ownerId !== currentUser?.uid) {
                    throw new Error('You are not authorized to edit this property');
                }
                
                // Pre-fill form with existing data
                setPropertyData({
                    title: property.title,
                    description: property.description || '',
                    address: property.address,
                    monthlyRent: property.monthlyRent.toString(),
                    propertyType: property.propertyType,
                    bedrooms: property.bedrooms.toString(),
                    bathrooms: property.bathrooms.toString(),
                    amenities: property.amenities?.join(', ') || '',
                    images: property.images || []
                });
            } catch (error) {
                console.error("Error loading property:", error);
                setError(error.message);
                navigate('/my-listings');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperty();
    }, [propertyId, currentUser, navigate]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 4 - propertyData.images.length);
        
        if (files.length === 0) return;

        setSelectedFiles(files);

        const oversizedFiles = files.filter(file => file.size > 900000);
        if (oversizedFiles.length > 0) {
            setError(`Some images are too large (max 900KB each)`);
            return;
        }

        const fileReaders = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target.result);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders)
            .then(base64Images => {
                setPropertyData({
                    ...propertyData,
                    images: [...propertyData.images, ...base64Images].slice(0, 4)
                });
                setError(null);
            })
            .catch(error => {
                setError('Error processing images');
                console.error(error);
            });
    };

    const removeImage = (index) => {
        const newImages = [...propertyData.images];
        newImages.splice(index, 1);
        setPropertyData({
            ...propertyData,
            images: newImages
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropertyData({
            ...propertyData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validation
        if (!propertyData.images.length) {
            setError('Please upload at least one image');
            return;
        }
        if (!propertyData.monthlyRent || isNaN(propertyData.monthlyRent)) {
            setError('Please enter a valid monthly rent amount');
            return;
        }
        if (!propertyData.address.trim()) {
            setError('Please enter a valid address');
            return;
        }

        setIsSubmitting(true);
        
        try {
            await updateProperty(propertyId, {
                ...propertyData,
                monthlyRent: Number(propertyData.monthlyRent),
                bedrooms: Number(propertyData.bedrooms),
                bathrooms: Number(propertyData.bathrooms),
                amenities: propertyData.amenities.split(',').map(item => item.trim()).filter(item => item),
                ownerId: currentUser.uid,
                ownerEmail: currentUser.email,
                createdAt: new Date().toISOString(),
                isAvailable: true
            });
            navigate('/my-listings');
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message || 'Failed to update property');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Property</h1>
                    <button 
                        onClick={() => navigate('/my-listings')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Property Type */}
                    <div>
                        <label className="block text-gray-700 mb-2">Property Type*</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="propertyType"
                                    value="apartment"
                                    checked={propertyData.propertyType === 'apartment'}
                                    onChange={handleChange}
                                    className="form-radio h-5 w-5 text-indigo-600"
                                />
                                <span className="ml-2">Apartment</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="propertyType"
                                    value="house"
                                    checked={propertyData.propertyType === 'house'}
                                    onChange={handleChange}
                                    className="form-radio h-5 w-5 text-indigo-600"
                                />
                                <span className="ml-2">House</span>
                            </label>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-gray-700 mb-2">Property Title*</label>
                        <input
                            type="text"
                            name="title"
                            value={propertyData.title}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-gray-700 mb-2">Full Address*</label>
                        <input
                            type="text"
                            name="address"
                            value={propertyData.address}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Monthly Rent */}
                    <div>
                        <label className="block text-gray-700 mb-2">Monthly Rent (CAD)*</label>
                        <input
                            type="number"
                            name="monthlyRent"
                            value={propertyData.monthlyRent}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            min="0"
                            required
                        />
                    </div>

                    {/* Bedrooms and Bathrooms */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Bedrooms*</label>
                            <select
                                name="bedrooms"
                                value={propertyData.bedrooms}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {[1, 2, 3, 4, 5, '6+'].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Bathrooms*</label>
                            <select
                                name="bathrooms"
                                value={propertyData.bathrooms}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {[1, 2, 3, 4, '5+'].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={propertyData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows="3"
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-gray-700 mb-2">Amenities (comma separated)</label>
                        <input
                            type="text"
                            name="amenities"
                            value={propertyData.amenities}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="e.g. Parking, Gym, Pool"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-gray-700 mb-2">Property Images* (Max 4)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-2 border rounded"
                            disabled={propertyData.images.length >= 4 || isSubmitting}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {propertyData.images.length} image(s) selected
                            {propertyData.images.length < 4 && ` - You can add ${4 - propertyData.images.length} more`}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {propertyData.images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={img} 
                                        alt={`Preview ${index}`} 
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiTrash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-white rounded w-full ${
                            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Property'}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default EditProperty;