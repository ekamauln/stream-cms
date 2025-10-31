// Helper function to upload poster image
export async function uploadPosterImage(file: File, slug: string): Promise<string> {
  try {
    console.log("Starting poster upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      slug: slug
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);

    const response = await fetch("/api/upload/poster", {
      method: "POST",
      body: formData,
    });

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed with response:", errorText);
      
      let errorMessage = "Upload failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    
    return result.url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}