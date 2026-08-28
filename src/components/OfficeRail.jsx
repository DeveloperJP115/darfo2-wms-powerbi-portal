import { Link } from "react-router-dom";
import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

export default function OfficeRail() {
  return (
    <div className="border-rail-edge w-[46px] shrink-0 border-r bg-white">
      <div className="flex flex-col items-center gap-3 py-3">
        <Link to="/" aria-label="Home">
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-7"
          />
        </Link>
      </div>
    </div>
  );
}
