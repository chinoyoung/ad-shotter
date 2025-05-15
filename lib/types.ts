export interface ScreenshotPreset {
  id?: string;
  name: string;
  url: string;
  selector: string;
  category: string;
  subcategory: string;
  viewportWidth: number;
  viewportHeight: number;
  description?: string;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
}

export const PresetCategories = {
  HOMEPAGE: "HOMEPAGE ADVERTISING SPECS",
  DIRECTORY: "DIRECTORY LANDING PAGE ADVERTISING SPECS",
  SEARCH: "SEARCH RESULTS PAGE ADVERTISING SPECS",
  PREMIUM: "PREMIUM LISTING FEATURES",
  ARTICLE: "ARTICLE DIRECTORY ADVERTISING",
  TRAVEL: "TRAVEL RESOURCE ADVERTISING",
};

export const PresetSubcategories: Record<string, string[]> = {
  [PresetCategories.HOMEPAGE]: [
    "Ad A: Homepage Premier Feature",
    "Ad B: Homepage Feature",
    "Ad C: Homepage Organizational Feature",
    "Ad E: Homepage Video",
  ],
  [PresetCategories.DIRECTORY]: [
    "Ad F: Directory Headline Photo",
    "Ad G: Premier Sponsorship",
    "Ad H: Directory Premier Feature",
    "Ad I: Directory Featured Program",
    "Ad J: Directory Organizational Feature",
    "Ad L: Directory Video",
  ],
  [PresetCategories.SEARCH]: [
    "Ad M: Results Headline Photo",
    "Ad N: Results Feature",
    "Ad O: Listing Photo",
    "Ad Q: Hot Jobs Listing",
    "Ad R: Results Page Flyer Ad",
  ],
  [PresetCategories.PREMIUM]: [
    "Ad K: Customized Provider Page Cover Photo",
    "Ad T: Listing Cover Photo / Ad D: Customized Listing Cover Photo",
  ],
  [PresetCategories.ARTICLE]: [
    "Ad DD: Article Directory Organizational Feature",
    "Ad EE: Article Directory Feature",
  ],
  [PresetCategories.TRAVEL]: [
    "GG. Travel Resource Homepage Headline Photo",
    "HH. Travel Resources Headline Photo",
    "II. Travel Resource Feature",
    "JJ. Example (Desktop)",
    "KK. Travel Insurance Headline Photo",
    "LL. Travel Insurance Listing Feature",
    "MM. Scholarship Homepage Headline Photo",
    "NN. Embassy Directory Feature",
  ],
};

export interface BulkScreenshotItem {
  url: string;
  selector: string;
  category?: string;
  subcategory?: string;
  description?: string;
}

export interface BulkScreenshotPreset {
  id?: string;
  name: string;
  items: BulkScreenshotItem[];
  viewportWidth: number;
  viewportHeight: number;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
}
