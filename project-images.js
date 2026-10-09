const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const directory = path.join(__dirname, "public/uploads/projects");
const maxBytes = 2 * 1024 * 1024;
function parse(value) {
	if (!value) return null;
	if (typeof value !== "string")
		throw Error("Please choose a PNG, JPG, or WebP image.");
	const match =
		/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
	if (!match) throw Error("Please choose a PNG, JPG, or WebP image.");
	const data = Buffer.from(match[2], "base64");
	if (!data.length || data.length > maxBytes)
		throw Error("Project images must be no larger than 2 MB.");
	const type = match[1];
	const valid =
		type === "png"
			? data
					.subarray(0, 8)
					.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
			: type === "jpeg"
				? data[0] === 255 && data[1] === 216 && data[2] === 255
				: data.toString("ascii", 0, 4) === "RIFF" &&
					data.toString("ascii", 8, 12) === "WEBP";
	if (!valid)
		throw Error(
			"The file does not match its image format. Choose another image.",
		);
	return { data, extension: type === "jpeg" ? "jpg" : type };
}
function error(value) {
	try {
		parse(value);
		return "";
	} catch (e) {
		return e.message;
	}
}
function store(value) {
	const image = parse(value);
	if (!image) return "";
	fs.mkdirSync(directory, { recursive: true });
	const name = crypto.randomUUID() + "." + image.extension;
	fs.writeFileSync(path.join(directory, name), image.data, { flag: "wx" });
	return "/uploads/projects/" + name;
}
function remove(url) {
	if (
		typeof url !== "string" ||
		!/^\/uploads\/projects\/[a-f0-9-]+\.(png|jpg|webp)$/.test(url)
	)
		return;
	try {
		fs.unlinkSync(path.join(directory, path.basename(url)));
	} catch (e) {
		if (e.code !== "ENOENT")
			console.error("Could not remove old project image.");
	}
}
module.exports = { error, store, remove };
