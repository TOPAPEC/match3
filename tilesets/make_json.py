import json

def generate_sprite_json(spriteW, spriteH, spriteSheetW, spriteSheetH):
    sprite_data = {}
    tile_count = 1

    for y in range(0, spriteSheetH, spriteH):
        for x in range(0, spriteSheetW, spriteW):
            tile_key = f"tile{tile_count}"
            sprite_data[tile_key] = {
                "frame": {"x": x, "y": y, "w": spriteW, "h": spriteH},
                "sourceSize": {"w": spriteW, "h": spriteH},
                "spriteSourceSize": {"x": 0, "y": 0, "w": spriteW, "h": spriteH}
            }
            tile_count += 1
            # To avoid attempting to include partial tiles if the spritesheet width isn't a multiple of spriteW
            if x + spriteW > spriteSheetW:
                break
        # To avoid attempting to include partial tiles if the spritesheet height isn't a multiple of spriteH
        if y + spriteH > spriteSheetH:
            break

    return sprite_data

def main():
    spriteW = 100  # Replace with your sprite width
    spriteH = 100  # Replace with your sprite height
    spriteSheetW = 800  # Replace with your spritesheet width
    spriteSheetH = 800  # Replace with your spritesheet height

    data = generate_sprite_json(spriteW, spriteH, spriteSheetW, spriteSheetH)
    json_data = json.dumps(data, indent=2)
    print(json_data)

if __name__ == "__main__":
    main()