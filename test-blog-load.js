const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const blogDirectory = path.join(process.cwd(), "blog");
console.log("Blog directory:", blogDirectory);
console.log("Directory exists:", fs.existsSync(blogDirectory));

const filenames = fs.readdirSync(blogDirectory);
console.log("Total files:", filenames.length);

const mdFiles = filenames.filter(f => f.endsWith(".md") && !f.toLowerCase().includes("readme"));
console.log("Markdown blog files:", mdFiles.length);

if (mdFiles.length > 0) {
    const firstFile = mdFiles[0];
    const filePath = path.join(blogDirectory, firstFile);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    console.log("\nFirst blog:");
    console.log("  Title:", data.title);
    console.log("  Slug:", data.slug);
    console.log("  Category:", data.category);
    console.log("  Content length:", content.length);
}
