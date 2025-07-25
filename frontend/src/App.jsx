import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { MessageSquare, Mail, Building, Upload, Send, MessageCircle } from 'lucide-react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    floor: '',
    room: '',
    complaint: '',
    image: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (100MB = 100 * 1024 * 1024 bytes)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size is too large. Maximum size allowed is 100MB.')
        e.target.value = '' // Clear the input
        return
      }
    }
    setFormData(prev => ({
      ...prev,
      image: file
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })

      // Use backend API endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/submit-complaint`, {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          floor: '',
          room: '',
          complaint: '',
          image: null
        })
        // Reset file input
        document.getElementById('image-upload').value = ''
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello, I would like to submit a complaint/feedback for Rose Villa.`)
    window.open(`https://wa.me/8801982780739?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100">
      {/* Header Section */}
      <div className="text-center pt-12 pb-8">
        <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center">
          <img src="/rose_villa_logo.png" alt="Rose Villa Logo" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-4xl font-bold text-pink-600 mb-2">Rose Villa</h1>
        <p className="text-xl text-pink-700">Complaint & Feedback System</p>
      </div>

      {/* Main Form Card */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            {/* Submit Your Complaint Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-pink-800">Submit Your Complaint</h2>
                <p className="text-pink-600 text-sm">We value your feedback and will address your concerns promptly</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-800">Personal Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-pink-800 font-semibold text-base mb-2 block">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-pink-50 border-pink-200 rounded-xl h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-pink-800 font-semibold text-base mb-2 block">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-pink-50 border-pink-200 rounded-xl h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-pink-800 font-semibold text-base mb-2 block">
                      Phone Number <span className="text-pink-500 text-sm ml-2">Optional</span>
                    </Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-pink-50 border-pink-200 rounded-xl h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-800">Location Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-pink-800 font-semibold text-base mb-2 block">
                      Floor Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="floor"
                      type="text"
                      value={formData.floor}
                      onChange={handleInputChange}
                      required
                      className="bg-pink-50 border-pink-200 rounded-xl h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      placeholder="e.g., 3rd Floor, Ground Floor"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-pink-800 font-semibold text-base mb-2 block">
                      Room Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="room"
                      type="text"
                      value={formData.room}
                      onChange={handleInputChange}
                      required
                      className="bg-pink-50 border-pink-200 rounded-xl h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      placeholder="e.g., 301, A-12"
                    />
                  </div>
                </div>
              </div>

              {/* Complaint Details Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-800">Complaint Details</h3>
                </div>
                
                <div>
                  <Label className="text-pink-800 font-semibold text-base mb-2 block">
                    Describe your complaint in detail <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    name="complaint"
                    value={formData.complaint}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="bg-pink-50 border-pink-200 rounded-xl text-base focus:border-pink-400 focus:ring-pink-400 resize-none"
                    placeholder="Please provide detailed information about your complaint or feedback..."
                  />
                </div>
              </div>

              {/* Supporting Evidence Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-800">Supporting Evidence</h3>
                </div>
                
                <div>
                  <Label className="text-pink-800 font-semibold text-base mb-2 block">
                    Upload Image <span className="text-pink-500 text-sm ml-2">Optional</span>
                  </Label>
                  <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center bg-pink-25">
                    <Upload className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                    <Input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer text-pink-600 font-medium text-base block mb-2"
                    >
                      Click to upload an image or drag and drop
                    </Label>
                    <p className="text-pink-500 text-sm">
                      Upload images less than 3 MB only. If it's bigger than 3 MB, please use WhatsApp.
                    </p>
                    {formData.image && (
                      <p className="text-green-600 text-sm mt-2 font-medium">
                        Selected: {formData.image.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl h-14"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Complaint
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-medium text-center">
                    ✅ Your complaint has been submitted successfully! We will get back to you soon.
                  </p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 font-medium text-center">
                    ❌ There was an error submitting your complaint. Please try again or contact us directly.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* WhatsApp Contact Card */}
        <Card className="bg-white rounded-3xl shadow-xl border-0 mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-pink-800">Quick Contact</h3>
            </div>
            
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg rounded-xl h-14 mb-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            
            <p className="text-pink-600 text-center text-sm">
              পানি নাই? নাকি ছোটখাটো সমস্যা? Just whatspp us
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

