/* Sổ đăng ký các dạng bài tự sinh + bộ dựng đề theo ma trận */
import type { Template } from "./core.ts";
import { TEMPLATES as toan10 } from "./toan10.ts";
import { TEMPLATES as toan11 } from "./toan11.ts";
import { TEMPLATES as toan12 } from "./toan12.ts";
import { TEMPLATES as ly10 } from "./ly10.ts";
import { TEMPLATES as ly11 } from "./ly11.ts";
import { TEMPLATES as ly12 } from "./ly12.ts";
import { TEMPLATES as hoa10 } from "./hoa10.ts";
import { TEMPLATES as hoa11 } from "./hoa11.ts";
import { TEMPLATES as hoa12 } from "./hoa12.ts";

export const TEMPLATES: Template[] = [...toan10, ...toan11, ...toan12, ...ly10, ...ly11, ...ly12, ...hoa10, ...hoa11, ...hoa12];
