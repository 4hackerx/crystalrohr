import Link from "next/link";
import { useAccount } from "wagmi";
import CustomSIWEButton from "../molecules/custom-siwe-button";
import DisconnectButton from "../molecules/disconnect-button";

const Header = () => {
  const { address } = useAccount();

  return (
    <header className="bg-black backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-[#550EFB] mb-4 sm:mb-0">
          <Link href="/" className="hover:underline">
            <span className="text-[#550EFB]">C</span>rystal
            <span className="text-[#550EFB]">R</span>ohr
          </Link>
        </h1>

        {address ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <nav className="flex gap-5">
              <Link
                href="/token-management"
                className="text-lg text-white font-bold hover:border-b-2 hover:border-b-[#550EFB] focus:border-b-2 focus:border-b-[#550EFB] transition-all duration-200"
              >
                Wallet
              </Link>
              <Link
                href="/account-settings"
                className="text-lg text-white font-bold hover:border-b-2 hover:border-b-[#550EFB] focus:border-b-2 focus:border-b-[#550EFB] transition-all duration-200"
              >
                Profile
              </Link>
            </nav>
            <DisconnectButton />
          </div>
        ) : (
          <CustomSIWEButton />
        )}
      </div>
    </header>
  );
};

export default Header;
