/*
  # Create Short Form Content Table

  1. New Tables
    - `short_form_content`
      - `id` (uuid, primary key)
      - `title` (text) - Judul konten
      - `description` (text) - Deskripsi konten
      - `video_url` (text) - URL video yang diupload
      - `thumbnail_url` (text, optional) - URL thumbnail
      - `author_id` (uuid) - Referensi ke tabel users
      - `author_name` (text) - Nama pembuat konten
      - `category` (text) - Kategori konten (education, news, tips, case-study, other)
      - `tags` (text array) - Tags untuk konten
      - `views` (integer) - Jumlah views
      - `likes` (integer) - Jumlah likes
      - `status` (text) - Status moderasi (pending, approved, rejected)
      - `rejection_reason` (text, optional) - Alasan penolakan jika ditolak
      - `created_at` (timestamptz) - Waktu dibuat
      - `updated_at` (timestamptz) - Waktu update terakhir

  2. Indexes
    - Index pada author_id untuk query cepat
    - Index pada status untuk filtering
    - Index pada created_at untuk sorting

  3. Security
    - Enable RLS on `short_form_content` table
    - Authenticated users can create their own content
    - Everyone can view approved content
    - Users can view their own content regardless of status
    - Only admins can update status (approve/reject)
*/

-- Create short_form_content table
CREATE TABLE IF NOT EXISTS short_form_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  tags text[] DEFAULT '{}',
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('education', 'news', 'tips', 'case-study', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_short_form_author ON short_form_content(author_id);
CREATE INDEX IF NOT EXISTS idx_short_form_status ON short_form_content(status);
CREATE INDEX IF NOT EXISTS idx_short_form_created ON short_form_content(created_at DESC);

-- Create user_likes table for tracking likes
CREATE TABLE IF NOT EXISTS short_form_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES short_form_content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_short_form_likes_content ON short_form_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_short_form_likes_user ON short_form_likes(user_id);

-- Enable RLS
ALTER TABLE short_form_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_form_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for short_form_content

-- Everyone can view approved content
CREATE POLICY "Anyone can view approved content"
  ON short_form_content
  FOR SELECT
  USING (status = 'approved');

-- Users can view their own content regardless of status
CREATE POLICY "Users can view own content"
  ON short_form_content
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = author_id::text);

-- Authenticated users can create content
CREATE POLICY "Users can create content"
  ON short_form_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = author_id::text);

-- Users can update their own pending content
CREATE POLICY "Users can update own pending content"
  ON short_form_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = author_id::text AND status = 'pending')
  WITH CHECK (auth.uid()::text = author_id::text);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON short_form_content
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = author_id::text);

-- RLS Policies for short_form_likes

-- Users can view all likes
CREATE POLICY "Users can view likes"
  ON short_form_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can add their own likes
CREATE POLICY "Users can add likes"
  ON short_form_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can remove their own likes
CREATE POLICY "Users can remove likes"
  ON short_form_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create function to update views count
CREATE OR REPLACE FUNCTION increment_short_form_views(content_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE short_form_content
  SET views = views + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle like/unlike
CREATE OR REPLACE FUNCTION toggle_short_form_like(content_id uuid, user_id uuid)
RETURNS json AS $$
DECLARE
  like_exists boolean;
  new_like_count integer;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM short_form_likes
    WHERE short_form_likes.content_id = toggle_short_form_like.content_id
    AND short_form_likes.user_id = toggle_short_form_like.user_id
  ) INTO like_exists;

  IF like_exists THEN
    -- Unlike
    DELETE FROM short_form_likes
    WHERE short_form_likes.content_id = toggle_short_form_like.content_id
    AND short_form_likes.user_id = toggle_short_form_like.user_id;
    
    UPDATE short_form_content
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = toggle_short_form_like.content_id;
  ELSE
    -- Like
    INSERT INTO short_form_likes (content_id, user_id)
    VALUES (toggle_short_form_like.content_id, toggle_short_form_like.user_id);
    
    UPDATE short_form_content
    SET likes = likes + 1
    WHERE id = toggle_short_form_like.content_id;
  END IF;

  -- Get updated like count
  SELECT likes INTO new_like_count
  FROM short_form_content
  WHERE id = toggle_short_form_like.content_id;

  RETURN json_build_object(
    'liked', NOT like_exists,
    'likes', new_like_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;