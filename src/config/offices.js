/**
 * SINGLE SOURCE OF TRUTH FOR THIS PORTAL.
 *
 * This is the only file you need to edit to change content. It drives the
 * switchboard, the rail, the routes, the embeds, and the footer. You should
 * never have to open a component to change wording or add an office.
 *
 * The number of offices is not fixed — the portal works with however many
 * entries OFFICES holds, so never write a count into copy or markup.
 *
 * THIS FILE IS TAB-INDENTED. The rest of the codebase is 2-space. That is
 * deliberate; do not let an editor convert it.
 */

import { isValidEmbedUrl } from "./validate.js";

export const SITE = {
	title: "DA–RFO 02 Analytics Portal",
	office: "Department of Agriculture Regional Field Office 02",

	/*
	 * The portal is for internal presentation, and the copy says so. It does NOT
	 * say "private" or "secure": reports are embedded with Power BI's publish to
	 * web, so the URL is openable by anyone who has it. Claiming otherwise would
	 * be a claim the portal cannot keep.
	 */
	audience: "For internal presentation use",

	intro:
		"Dashboards for the divisions, stations and research centers of the " +
		"regional field office. Choose an office to view its reports.",

	// Image files in /public. If one fails to load, a lettered monogram renders
	// in its place instead of a broken image.
	logos: {
		da: "/da-logo.png",
		bagongPilipinas: "/bp.png",
		ntc: "/ntc.png",
	},

	contact: {
		officeName: "Regional Office",
		address: "Nursery Compound, San Gabriel, Tuguegarao City, Cagayan 3500",
		region: "Region 02 — Philippines",
		phone: "(078) 396-1328",
		email: "ored.rfo2@da.gov.ph",
		website: "https://cagayanvalley.da.gov.ph/",
	},

	vision:
		"Cagayan Valley as Modernized and Industrialized Consolidation hub for quality " +
		"pre-processed and processed foods-feeds farm products.",

	/*
	 * Shown once per browser tab. The wording is the public RGA
	 * portal's, minus the RGA's mention of its own registry system (RSBSA).
	 * `icon` is one of: eye, shield, document.
	 */
	privacyNotice: {
		title: "Data Privacy Notice",
		sections: [
			{
				icon: "eye",
				heading: "Our Commitment to Your Privacy",
				body:
					"We, at the Department of Agriculture, protect the privacy of your personal " +
					'and sensitive personal information ("Personal Data") and commit to comply ' +
					'with the Republic Act No. 10173 or the Data Privacy Act ("DPA"), its ' +
					'Implementing Rules and Regulations ("IRR"), and other relevant issuances ' +
					"of the National Privacy Commission.",
			},
			{
				icon: "shield",
				heading: "How We Protect Your Data",
				body:
					"Our goal is to protect your personal data on the channels you interact " +
					"with us – through our website, our official emails, our offices, physical " +
					"and digital forms submitted, mobile applications and online platforms.",
			},
			{
				icon: "document",
				heading: "What This Notice Covers",
				body:
					"This Privacy Notice outlines our approach on how we protect your privacy " +
					"and explains in general terms the purpose and legal basis for the " +
					"processing of personal data that the Department collects from you, the " +
					"measures in place to protect your data privacy, and the rights that you " +
					"may exercise in relation to such information.",
			},
		],
	},
};

/**
 * The headings the switchboard and the rail both group by.
 *
 * Both read this list rather than assembling their own, so they cannot
 * disagree about grouping or order.
 */
export const GROUPS = [
	{ id: "divisions", label: "Divisions" },
	{ id: "stations", label: "Stations & Research Centers" },
];

/**
 * Every office, in the order it appears.
 *
 * To add one: add an entry. The tile, the rail entry and the routes all follow.
 *
 * reports: an office holds zero or more. `embedUrl` takes the Power BI secure
 *   embed link, from File › Embed report › Website or portal, which looks like
 *   https://app.powerbi.com/reportEmbed?reportId=<GUID>&autoAuth=true&ctid=<TENANT>
 *   Viewers sign in inside the frame, so the link is not a secret. Leave it an
 *   empty string until the report exists — the page then renders a "not
 *   published yet" card rather than a broken iframe.
 *
 * Offices without a real report hold one placeholder. Replace the name and add
 * siblings as the office confirms them.
 *
 * UNCONFIRMED: the expanded names of the eight division codes are drafted here
 * and have not been checked by the office. So is "Isabela Experiment Station" —
 * the original brief called it Ilagan. BES and SCRC are confirmed.
 */
const placeholder = () => [
	{ slug: "dashboard", name: "Dashboard", embedUrl: "", blurb: "" },
];

export const OFFICES = [
	{
		slug: "pmed",
		code: "PMED",
		name: "Planning, Monitoring and Evaluation Division",
		group: "divisions",
		blurb: "",
		reports: [
			{
				slug: "dashboard",
				name: "Dashboard",
				embedUrl:
					"https://app.powerbi.com/reportEmbed?reportId=ac5acc8b-52ad-4e07-b9d8-54f2459179b3&autoAuth=true&ctid=6898061d-1a6b-4e39-adfc-dc8afe072201",
				blurb: "",
			},
		],
	},
	{
		slug: "amad",
		code: "AMAD",
		name: "Agribusiness and Marketing Assistance Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "ild",
		code: "ILD",
		name: "Integrated Laboratories Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "raed",
		code: "RAED",
		name: "Regional Agricultural Engineering Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "fod",
		code: "FOD",
		name: "Field Operations Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "fad",
		code: "FAD",
		name: "Finance and Administrative Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "research",
		code: "Research",
		name: "Research Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "regulatory",
		code: "Regulatory",
		name: "Regulatory Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "nces",
		code: "NCES",
		name: "Northern Cagayan Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "ies",
		code: "IES",
		name: "Isabela Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "cvrc",
		code: "CVRC",
		name: "Cagayan Valley Research Center",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "scrc",
		code: "SCRC",
		name: "Southern Cagayan Research Center",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "qes",
		code: "QES",
		name: "Quirino Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "bes",
		code: "BES",
		name: "Batanes Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
];

/** The offices under one heading, in config order. Unknown group gives []. */
export const officesInGroup = (groupId) =>
	OFFICES.filter((office) => office.group === groupId);

/** Look up an office by its route slug. Returns undefined for unknown slugs. */
export const findOffice = (slug) =>
	OFFICES.find((office) => office.slug === slug);

/**
 * Look up one report inside one office.
 *
 * Scoped to the office on purpose: two offices may both hold a report slugged
 * "accomplishment", which is why the route is /:office/:report.
 */
export const findReport = (officeSlug, reportSlug) =>
	findOffice(officeSlug)?.reports?.find((report) => report.slug === reportSlug);

/**
 * A report is live once it holds an embed URL the portal can actually render.
 *
 * A filled-in but unusable URL is deliberately NOT live: otherwise a tile would
 * advertise a working report and then show an empty frame. Such a URL is not
 * silently treated as missing either — DashboardEmbed says what is wrong with it.
 */
export const isLive = (report) => isValidEmbedUrl(report?.embedUrl);

/**
 * What /:office renders: the first published report, or the first listed if
 * none are published yet.
 *
 * Preferring a published one matters during rollout — an office whose second
 * report goes live first should open on the one that has something to show.
 */
export const defaultReport = (office) =>
	office?.reports?.find((report) => isLive(report)) ?? office?.reports?.[0];
