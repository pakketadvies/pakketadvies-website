"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var https_1 = __importDefault(require("https"));
var openai_1 = __importDefault(require("openai"));
var apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('❌ OPENAI_API_KEY ontbreekt.');
    process.exit(1);
}
var client = new openai_1.default({ apiKey: apiKey });
var OUTPUT_DIR = path_1.default.join(process.cwd(), 'public', 'images');
var basePrompt = 'Ultra high quality, realistic business photo, modern Dutch SME context, clean white office, soft daylight, minimal styling, subtle energy theme, color palette navy (#1A3756) and teal (#00AF9B) accents, professional, trustworthy, no text, no logos, no watermarks.';
var images = [
    {
        filename: 'hero-main.jpg',
        size: '1792x1024',
        prompt: basePrompt + ' Wide shot energy consultant and business owner next to large wall screen showing abstract energy graphs, clean white office interior, glass walls, confident, background slightly blurred.',
    },
    {
        filename: 'features-dashboard.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Close-up white desk with laptop showing abstract energy usage dashboard, stacked contracts, pen, minimal composition, soft shadows.',
    },
    {
        filename: 'how-it-works-docs.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Top-down shot three printed pages on white desk: energy overview, comparison, signed contract, pen placed neatly, navy and teal highlights.',
    },
    {
        filename: 'calculator-laptop.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Close-up hands typing on laptop with clean energy calculator interface on screen, white desk, small plant blurred background, navy teal UI.',
    },
    {
        filename: 'contract-signing.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Close-up business person signing energy contract with pen on white table, second hand pointing at line, navy teal highlights, office blurred.',
    },
    {
        filename: 'testimonial-bakery.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Owner small modern bakery standing in shop, talking with energy consultant at table with laptop showing graphs, warm minimal interior.',
    },
    {
        filename: 'testimonial-warehouse.jpg',
        size: '1024x1024',
        prompt: basePrompt + ' Owner logistics company in modern warehouse with energy consultant reviewing tablet with energy graphs, forklifts shelves blurred background.',
    },
    {
        filename: 'solar-roof.jpg',
        size: '1792x1024',
        prompt: basePrompt + ' Commercial rooftop covered with solar panels, modern industrial area background, clear sky, subtle teal tint reflections, clean minimal, no people.',
    },
];
function downloadImage(url, dest) {
    return new Promise(function (resolve, reject) {
        var file = fs_1.default.createWriteStream(dest);
        https_1.default.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                resolve();
            });
        }).on('error', function (err) {
            fs_1.default.unlink(dest, function () { });
            reject(err);
        });
    });
}
function generateImage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var response, imageUrl, outPath;
        var _c, _d;
        var filename = _b.filename, prompt = _b.prompt, _e = _b.size, size = _e === void 0 ? '1024x1024' : _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log("\u25B6\uFE0F  Generating ".concat(filename, " ..."));
                    return [4 /*yield*/, client.images.generate({
                            model: 'dall-e-3',
                            prompt: prompt,
                            size: size,
                            n: 1,
                        })];
                case 1:
                    response = _f.sent();
                    imageUrl = (_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.url;
                    if (!imageUrl) {
                        throw new Error("Geen image URL ontvangen voor ".concat(filename));
                    }
                    if (!fs_1.default.existsSync(OUTPUT_DIR)) {
                        fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
                    }
                    outPath = path_1.default.join(OUTPUT_DIR, filename);
                    return [4 /*yield*/, downloadImage(imageUrl, outPath)];
                case 2:
                    _f.sent();
                    console.log("\u2705  ".concat(filename, " opgeslagen in public/images"));
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, images_1, spec, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Beelden genereren voor PakketAdvies...');
                    _i = 0, images_1 = images;
                    _a.label = 1;
                case 1:
                    if (!(_i < images_1.length)) return [3 /*break*/, 6];
                    spec = images_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, generateImage(spec)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("\u274C Fout bij ".concat(spec.filename, ":"), err_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log('✨ Klaar!');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('❌ Fout:', err);
    process.exit(1);
});
