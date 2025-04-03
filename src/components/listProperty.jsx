import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from "../contexts/authContext/index";
import { useNavigate } from "react-router-dom";
import { uploadProperty } from "../firebase/properties";
import Layout from './layout';

const ListProperty = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        return () => {
            selectedFiles.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
        };
    }, [selectedFiles]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        
        if (files.length === 0) {
            setError('Please select at least one image');
            return;
        }

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
                    images: base64Images
                });
                setError(null);
            })
            .catch(error => {
                setError('Error processing images');
                console.error(error);
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
        
        if (!propertyData.images.length) {
            setError('Please upload at least one image');
            return;
        }
        if (propertyData.images.some(img => img.length > 900000)) {
            setError('One or more images are too large (max ~900KB each)');
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

        setLoading(true);
        
        try {
            await uploadProperty({
                ...propertyData,
                monthlyRent: Number(propertyData.monthlyRent),
                bedrooms: Number(propertyData.bedrooms),
                bathrooms: Number(propertyData.bathrooms)
            }, currentUser.uid, currentUser.email);
            navigate('/home');
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.message || 'Failed to submit property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">List Your Property</h1>
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
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-2 border rounded"
                            required
                            disabled={loading}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedFiles.length} image(s) selected
                        </p>
                        <div className="flex flex-wrap mt-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="w-1/4 p-1">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`Preview ${index}`} 
                                        className="w-full h-20 object-cover rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded w-full ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {loading ? 'Submitting...' : 'List Property'}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default ListProperty;