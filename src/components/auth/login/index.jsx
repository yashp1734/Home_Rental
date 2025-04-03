import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { doSignInWithEmailAndPassword, sendPasswordResetEmail } from '../../../firebase/auth'
import { useAuth } from '../../../contexts/authContext'

const Login = () => {
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [showResetModal, setShowResetModal] = useState(false)
    const [resetMessage, setResetMessage] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await doSignInWithEmailAndPassword(email, password)
            } catch (error) {
                if (error.code === 'auth/invalid-credential') {
                    alert('Invalid email or password. Please try again.')
                } else if (error.code === 'auth/too-many-requests') {
                    alert('Too many failed attempts. Please try again later or reset your password.')
                } else {
                    alert('Login failed. Please try again.')
                }
            } finally {
                setIsSigningIn(false)
            }
        }
    }

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            alert('Please enter your email address')
            return
        }

        try {
            await sendPasswordResetEmail(resetEmail)
            setResetMessage(`Password reset email sent to ${resetEmail}. Please check your inbox.`)
            setTimeout(() => {
                setShowResetModal(false)
                setResetMessage('')
            }, 3000)
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setResetMessage('No user found with this email address.')
            } else {
                setResetMessage('Error sending password reset email. Please try again.')
            }
        }
    }

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                    <div className="text-center">
                        <div className="mt-2">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome Back</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                placeholder='Enter your Email address'
                                required
                                value={email} 
                                onChange={(e) => { setEmail(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-600 font-bold">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete='current-password'
                                    placeholder='Enter your valid password'
                                    required
                                    value={password} 
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center mt-2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm">Don't have an account? <Link to={'/register'} className="hover:underline font-bold">Sign up</Link></p>
                </div>
            </main>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Reset Password</h3>
                        <p className="mb-4">Enter your email address to receive a password reset link.</p>
                        
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Your email address"
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                        />
                        
                        {resetMessage && (
                            <p className={`mb-4 ${resetMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                                {resetMessage}
                            </p>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowResetModal(false)
                                    setResetMessage('')
                                }}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordReset}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Send Reset Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Login