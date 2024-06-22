from PIL import Image
import os
import math

def process_image(image, size=(112, 112)):
    """Resize image to the specified size using LANCZOS resampling and center it on a white background."""
    image.thumbnail(size, Image.LANCZOS)

    # Create a white background
    new_image = Image.new("RGB", size, (255, 255, 255))
    
    # Preserve transparency by converting rgba (if necessary) and pasting with white background
    if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
        alpha = image.convert('RGBA').split()[3]
        new_image.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2), mask=alpha)
    else:
        new_image.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    
    return new_image

def unite_images(directory, output_path="united_images.png"):
    """Read all images in directory, resize and unite them into a multi-row image."""
    images = []
    for filename in sorted(os.listdir(directory)):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            img_path = os.path.join(directory, filename)
            img = Image.open(img_path)
            img = process_image(img)
            images.append(img)
    
    if not images:
        print("No images found in the directory.")
        return
    # Calculate grid dimensions
    columns = 5  # or any number you want, or calculate based on the desired layout
    rows = math.ceil(len(images) / columns)
    image_size = (112, 112)  # the size we are resizing to

    united_image_width = columns * image_size[0]
    united_image_height = rows * image_size[1]

    united_image = Image.new("RGB", (united_image_width, united_image_height), (255, 255, 255))
    
    x_offset = 0
    y_offset = 0
    for index, img in enumerate(images):
        if index % columns == 0 and index != 0:
            x_offset = 0
            y_offset += image_size[1]
        united_image.paste(img, (x_offset, y_offset))
        x_offset += image_size[0]
    
    united_image.save(output_path)
    print(f"United image saved as {output_path}")

if __name__ == "__main__":
    image_directory = "."  # change this to your directory path
    unite_images(image_directory)
