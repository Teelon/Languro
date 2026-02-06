import os

file_path = r"d:\Gemini Hackathon\Languro\src\components\Hero\index.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
modified_trusted = False

i = 0
while i < len(lines):
    line = lines[i]
    
    # Modify the "Trusted by" section
    if "Trusted by serious learners worldwide" in line and not modified_trusted:
        # Go back to find the opening div (line 43 in 1-indexed view, so check around i-2)
        # We expect:
        # <div>
        #   <p ...>
        #     Trusted...
        #   </p>
        # </div>
        
        # Identify the block start
        # line i is text. line i-1 is <p>. line i-2 is <div>.
        # Let's verify context.
        if "<div>" in lines[i-2]:
            lines[i-2] = lines[i-2].replace("<div>", '<div className="mb-10 text-center">')
            modified_trusted = True
            
    # Remove the framework links div
    # It starts with <div className="wow fadeInUp ... gap-4 ...">
    # And check for play-bootstrap link inside just to be sure
    if 'className="wow fadeInUp flex items-center justify-center gap-4 text-center"' in line:
        # Check if this block contains the unwanted links
        # We can look ahead a bit or just assume since this class is unique here
        skip = True
        # Skip this line
        i += 1
        continue
        
    if skip:
        # We are skipping the unwanted div.
        # We need to find the closing div that corresponds to it.
        # The unwanted div ends when we see the closing </div> indented correctly?
        # Or we can count braces? JSX is tricky.
        # But we know the structure from viewing the file.
        # It ends at line 179 (1-indexed) which is indented with 16 spaces.
        # <div ...> (line 48) is 16 spaces indented.
        # The closing </div> is 16 spaces indented.
        
        if line.strip() == "</div>" and line.startswith("                </div>"):
             # This is likely the closing div.
             # Double check if we are actually in the block.
             print(f"Skipping closing div at line {i+1}")
             skip = False
             i += 1
             continue
        else:
            # Skip content
            i += 1
            continue

    new_lines.append(line)
    i += 1

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
