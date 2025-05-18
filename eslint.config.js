import raycastExportValue from "@raycast/eslint-config"; // Import the export
// eslint.config.js
import globals from "globals";

// Defensive handling: ensure we have an array, then flatten it completely.
// This handles cases where raycastExportValue might be a single config object,
// an array of config objects, or an array containing nested arrays of config objects.
let flattenedRaycastConfigs = [];
if (Array.isArray(raycastExportValue)) {
	flattenedRaycastConfigs = raycastExportValue.flat(Number.POSITIVE_INFINITY);
} else if (raycastExportValue && typeof raycastExportValue === "object") {
	// If it's a single config object, wrap it in an array
	flattenedRaycastConfigs = [raycastExportValue];
}
// Filter out any null/undefined items that might result from problematic flattening
flattenedRaycastConfigs = flattenedRaycastConfigs.filter(
	(config) => config != null,
);

export default [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	// Spread the completely flattened and filtered Raycast configurations
	...flattenedRaycastConfigs,
];
