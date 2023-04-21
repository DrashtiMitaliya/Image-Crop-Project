import React from 'react';
import { useState, useRef } from 'react'
import ReactCrop from 'react-image-crop'
import {
    FormControl,
    FormLabel,
    Input,
    ButtonGroup,
    Button
} from '@chakra-ui/react'
import { canvasPreview } from './canvasPreview'
import useDebounceEffect from './useDebounceEffect'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    function makeAspectCrop(crop, aspect, mediaWidth, mediaHeight) {
        const cropWidth = crop.width / 100 * mediaWidth;
        const cropHeight = cropWidth / aspect;
        const cropY = (mediaHeight - cropHeight) / 2;
        return {
            x: crop.x,
            y: cropY / mediaHeight * 100,
            width: cropWidth / mediaWidth * 100,
            height: cropHeight / mediaHeight * 100,
            unit: '%',
        };
    }
}


const Image = () => {


    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef(null)
    const imgRef = useRef(null)
    const hiddenAnchorRef = useRef(null)
    const blobUrlRef = useRef('')
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState(16 / 9)


    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            )
            reader.readAsDataURL(e.target.files[0])
        }
    }


    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }


    function onDownloadCropClick() {
        if (!previewCanvasRef.current) {
            throw new Error('Crop canvas does not exist')
        }

        previewCanvasRef.current.toBlob((blob) => {
            if (!blob) {
                throw new Error('Failed to create blob')
            }
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current)
            }
            blobUrlRef.current = URL.createObjectURL(blob)
            hiddenAnchorRef.current.href = blobUrlRef.current
            hiddenAnchorRef.current.click()
        })
    }



    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )





    return (
        <div className='container mt-5'>
            <FormControl>
                <FormLabel>Choose Image </FormLabel>
                <Input type='file' accept="image/*" onChange={onSelectFile} />
            </FormControl>


        <div className='my-3 '>
        {!!imgSrc && (
                <ReactCrop
                    style={{padding: '5px'}}
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
        </div>
            

            {!!completedCrop && (
                <>
                    <div>
                        <canvas className='my-3'
                            ref={previewCanvasRef}
                            style={{
                                margin :'auto' ,
                                border: '1px solid black',
                                objectFit: 'contain',
                                width: completedCrop.width,
                                height: completedCrop.height,
                            }}
                        />
                    </div>
                    <div>
                        <ButtonGroup  spacing='6'>
                            <Button colorScheme='blue' onClick={onDownloadCropClick}>Download Cropped Image</Button>
                        </ButtonGroup>
                        <a
                            ref={hiddenAnchorRef}
                            download
                            style={{
                                position: 'absolute',
                                top: '-200vh',
                                visibility: 'hidden',
                            }}
                        >
                            Hidden download
                        </a>
                    </div>
                </>
            )}


        </div>
    )
}

export default Image