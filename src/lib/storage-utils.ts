import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage and return the public URL
 */
export async function uploadAsset(file: File, folder: "images" | "audio"): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("game-assets")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("game-assets")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete an asset from storage
 */
export async function deleteAsset(url: string): Promise<void> {
  // Extract path from URL
  const urlParts = url.split("/game-assets/");
  if (urlParts.length < 2) return;
  
  const path = urlParts[1];
  
  const { error } = await supabase.storage
    .from("game-assets")
    .remove([path]);

  if (error) {
    console.error("Delete error:", error);
  }
}
