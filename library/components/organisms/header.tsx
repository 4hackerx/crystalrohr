const Header = () => {
  return(
  <div className="overflow-x-hidden ">
    <header className="bg-black backdrop-blur-md shadow-md">
    <div className="container px-4 py-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-[#550EFB]"><span className="text-[#550EFB]">C</span>rystal<span className="text-[#550EFB]">R</span>ohr</h1>
      <a href="#problem" className="text-white p-2 border border-3 border-transparent hover:border-b-[#550EFB]">Get Started</a>    
    </div>
  </header>
  </div>
  )
  ;
};

export default Header;
