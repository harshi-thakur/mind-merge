// AvatarUpload.js
import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebase.config';
import { metadata } from '@/app/layout';


export default async function firebaseUpload(file: any): Promise<string> {
  if (file) {
    const storageRef = ref(storage, `${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: 'image/' + file.name.split('.').pop() });
    const snapshot = await uploadTask;
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };
  return "";
}

export async function deleteImage(imagePath:string) {
  try {
    const imageRef = ref(storage, imagePath); // Create a reference to the image
    // Delete the file
    await deleteObject(imageRef);
    console.log(`Image at path "${imagePath}" has been deleted successfully.`);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}