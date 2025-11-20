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
var openai_1 = __importDefault(require("openai"));
/**
 * Script om marketingbeelden voor PakketAdvies te genereren via de OpenAI Images API.
 *
 * Gebruik (lokaal bij jou):
 * 1) Voeg in `.env.local` toe: OPENAI_API_KEY=jouweigenapikey
 * 2) Run:  npx ts-node scripts/generate-images.ts
 */
var apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('❌ OPENAI_API_KEY ontbreekt. Zet deze in je .env.local vóór je het script draait.');
    process.exit(1);
}
var client = new openai_1.default({ apiKey: apiKey });
var OUTPUT_DIR = path_1.default.join(process.cwd(), 'public', 'images');
var basePrompt = 'Ultra high quality, realistic business photo, modern Dutch SME and corporate context, clean white office or business environment, soft daylight, minimal styling, subtle energy theme (screens with energy usage graphs, contracts, charts), color palette navy (#1A3756) and teal (#00AF9B) accents, professional, trustworthy, no text, no logos, no watermarks.';
var images = [
    {
        filename: 'hero-main.jpg',
        size: '1792x1024',
        prompt: basePrompt +
            ' Wide shot of an energy consultant and business owner standing next to a large wall screen showing abstract energy price graphs and contract options, clean white office interior, glass walls, both looking confident, background slightly blurred.',
    },
    {
        filename: 'features-dashboard.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Close-up of a clean white desk with a laptop showing an abstract energy usage and tariff comparison dashboard, next to neatly stacked printed contracts and a pen, minimal composition, soft shadows, charts visible but not readable.',
    },
    {
        filename: 'how-it-works-docs.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Top-down shot of three printed pages on a white desk: energy usage overview, contract comparison, and signed contract, with a pen placed neatly, minimal layout, navy and teal highlights on the documents, text hinting at structure but not readable.',
    },
    {
        filename: 'calculator-laptop.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Close-up of hands typing on a laptop with a clean energy savings calculator interface on screen, simple charts and numbers visible but not readable, white desk, small plant slightly blurred in the background, navy and teal UI elements.',
    },
    {
        filename: 'contract-signing.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Close-up of a business person signing an energy contract with a high-quality pen on a clean white table, second hand pointing at a specific line on the contract, subtle navy and teal highlights in pen or folder, background office blurred, no readable text.',
    },
    {
        filename: 'testimonial-bakery.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Owner of a small modern bakery standing in the shop, talking with an energy consultant at a small table with a laptop open on abstract energy usage graphs, warm but minimal interior, focus on trustworthy collaboration.',
    },
    {
        filename: 'testimonial-warehouse.jpg',
        size: '1024x1024',
        prompt: basePrompt +
            ' Owner of a logistics or transport company in a modern warehouse, standing with an energy consultant reviewing a tablet with abstract energy cost graphs, forklifts and shelves blurred in background, professional but approachable.',
    },
    {
        filename: 'solar-roof.jpg',
        size: '1792x1024',
        prompt: basePrompt +
            ' Medium-sized commercial rooftop fully covered with solar panels, modern industrial area in background, clear sky, subtle teal tint in reflections, clean and minimal composition, no people, no logos.',
    },
];
function generateImage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var response, image, b64, buffer, outPath;
        var filename = _b.filename, prompt = _b.prompt, _c = _b.size, size = _c === void 0 ? '1024x1024' : _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("\u25B6\uFE0F  Generating ".concat(filename, " ..."));
                    return [4 /*yield*/, client.images.generate({
                            model: 'gpt-image-1',
                            prompt: prompt,
                            size: size,
                            n: 1,
                            response_format: 'b64_json',
                        })];
                case 1:
                    response = _d.sent();
                    image = response.data && response.data[0];
                    b64 = image === null || image === void 0 ? void 0 : image.b64_json;
                    if (!b64) {
                        throw new Error("Geen base64 data ontvangen voor ".concat(filename));
                    }
                    buffer = Buffer.from(b64, 'base64');
                    if (!fs_1.default.existsSync(OUTPUT_DIR)) {
                        fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
                    }
                    outPath = path_1.default.join(OUTPUT_DIR, filename);
                    fs_1.default.writeFileSync(outPath, buffer);
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
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, generateImage(spec)];
                case 3:
                    // eslint-disable-next-line no-await-in-loop
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
                    console.log('✨ Klaar. Beelden staan in public/images.');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('❌ Onverwachte fout:', err);
    process.exit(1);
});
