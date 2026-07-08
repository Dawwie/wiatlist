import Link from "next/link";

export default function NoAccessPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="mb-2 text-2xl font-bold">Brak dostępu</h1>
      <p className="mb-6 text-gray-600">
        Wiatlist jest dostępny tylko dla zaproszonych domowników. Poproś
        właściciela o link z zaproszeniem.
      </p>
      <Link href="/setup" className="text-sm text-green-700 underline">
        Pierwsza konfiguracja
      </Link>
    </div>
  );
}
