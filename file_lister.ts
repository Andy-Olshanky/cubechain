import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(path);
    } else {
      return [path];
    }
  }));
  return files.flat();
}

async function main() {
  const srcDir = 'src';
  const outputFile = 'file_listing.txt';
  let output = '';

  try {
    const files = await listFiles(srcDir);

    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      output += `// ${file}\n${content}\n\n`;
    }

    await writeFile(outputFile, output);
    console.log(`File listing has been written to ${outputFile}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();