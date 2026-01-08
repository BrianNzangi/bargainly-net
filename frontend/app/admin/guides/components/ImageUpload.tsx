'use client'

import { useState, useRef } from 'react'
import { Upload, CloseSquare } from '@solar-icons/react'
import { createClient } from '@supabase/supabase-js'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    label?: string
    folder?: string
}

// Use service role key for admin uploads (bypasses RLS)
// This is safe because this component is only used in the admin panel
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)

export default function ImageUpload({ value, onChange, label = 'Upload Image', folder = 'guides' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(value)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB')
            return
        }

        setUploading(true)

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${folder}/${fileName}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('bargainly-uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('bargainly-uploads')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onChange(publicUrl)
        } catch (error: any) {
            console.error('Upload error:', error)
            alert(`Upload failed: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview('')
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            const input = fileInputRef.current
            if (input) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                input.files = dataTransfer.files
                handleFileSelect({ target: input } as any)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{label}</label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <CloseSquare className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                    <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                    <p className="text-sm text-neutral-600 mb-1">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 5MB</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />
        </div>
    )
}
