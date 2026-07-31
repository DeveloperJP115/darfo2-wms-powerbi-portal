/**
 * SINGLE SOURCE OF TRUTH FOR THIS PORTAL.
 *
 * This is the only file you need to edit to change content. It drives the
 * sidebar, the routes, the home page cards, the embeds, and the footer.
 * You should never have to open a component to change wording or add a station.
 */

export const SITE = {
	title: "WMS Analytics Portal",
	subtitle: "Warehouse Management System — DA-RFO 02",
	office: "Department of Agriculture Regional Field Office 02",
	publicAccessNote: "Public access — dashboards are viewable without a login.",

	// Shown on the home page under the hero.
	intro:
		"Warehouse analytics for the research centers and experiment stations of Cagayan Valley. " +
		"Each station publishes its own dashboard covering seed inventory, deliveries, withdrawals, " +
		"germination testing, and storage conditions. Pick a station to view its report.",

	// Drop the real image files into /public at these paths. Until then, the
	// header and footer render a lettered monogram instead of a broken image.
	logos: {
		da: "/da-logo.png",
		bagongPilipinas: "/bp.png",
	},

	contact: {
		officeName: "Regional Office",
		address: "Nursery Compound, San Gabriel, Tuguegarao City, Cagayan 3500",
		region: "Region 02 — Philippines",
		phone: "(078) 396-1328",
		hours: "Mon–Fri, 8:00 AM – 5:00 PM",
		email: "ored.rfo2@da.gov.ph",
	},

	vision:
		"Cagayan Valley as Modernized and Industrialized Consolidation hub for quality " +
		"pre-processed and processed foods-feeds farm products.",
};

/**
 * The five RCES stations, in the order they appear in the sidebar.
 *
 * To add a station: add an entry here. To remove one: delete its entry. The nav,
 * the route, and the home page card all follow automatically.
 *
 * embedUrl: paste the Power BI "Publish to web (public)" link, which looks like
 *   https://app.powerbi.com/view?r=<LONG_TOKEN>
 * Leave it as an empty string until the report is ready — the station page then
 * renders a "Dashboard coming soon" card instead of a broken iframe.
 */
export const STATIONS = [
	{
		slug: "nces",
		short: "NCES",
		name: "Northern Cagayan Experiment Station",
		embedUrl: "",
		blurb:
			"Seed inventory, deliveries, withdrawals, germination testing, and environmental logs for NCES.",
	},
	{
		slug: "ies",
		short: "IES",
		name: "Ilagan Experiment Station",
		embedUrl: "",
		blurb:
			"Warehouse stock movement and storage conditions for the Ilagan station.",
	},
	{
		slug: "cvrc",
		short: "CVRC",
		name: "Cagayan Valley Research Center",
		embedUrl: "",
		blurb:
			"Seed and input inventory for the regional research center at Ilagan.",
	},
	{
		slug: "scrc",
		short: "SCRC",
		// TODO(office): confirm the full official name for SCRC.
		name: "SCRC — full name to be confirmed",
		embedUrl: "",
		blurb:
			"Warehouse stock movement and storage conditions for the SCRC station.",
	},
	{
		slug: "qes",
		short: "QES",
		name: "Quirino Experiment Station",
		embedUrl: "",
		blurb:
			"Warehouse stock movement and storage conditions for the Quirino station.",
	},
];

/**
 * Optional regional roll-up that combines all stations into one report.
 * Set `enabled: false` to hide it from the nav and the home page entirely.
 */
export const REGIONAL_OVERVIEW = {
	enabled: true,
	slug: "overview",
	short: "ALL",
	name: "All Stations — Regional Overview",
	embedUrl: "",
	blurb:
		"Harmonized roll-up of all five stations for FOD-level reporting across the region.",
};

/**
 * Everything that gets a route and a sidebar entry, overview first when enabled.
 * Components read this rather than assembling the list themselves.
 */
export const DASHBOARDS = REGIONAL_OVERVIEW.enabled
	? [REGIONAL_OVERVIEW, ...STATIONS]
	: STATIONS;

/** A dashboard is live once someone has pasted an embed URL into it. */
export const isLive = (dashboard) => Boolean(dashboard?.embedUrl?.trim());

/** Look up a dashboard by its route slug. Returns undefined for unknown slugs. */
export const findDashboard = (slug) => DASHBOARDS.find((d) => d.slug === slug);
