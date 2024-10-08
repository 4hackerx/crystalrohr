import Link from "next/link";

const page = () => {
  return (
    <>
      <div className="max-h-screen bg-gradient-to-r from-black to-[#550EFB] ">
        <main className="container ">
          <section className="text-center h-screen flex items-center justify-center gap-3 flex-col">
            <h2 className="text-6xl font-bold text-white mb-4">
              Bring Clarity to Online Videos
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Make your content accessible to millions of visually impaired
              users
            </p>
            <Link
              href="/role-based"
              className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get Started
            </Link>
          </section>
        </main>
      </div>
    </>
  );
};

export default page;
