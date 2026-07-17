import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; 

export const BackButton = () => {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
      <ArrowLeft size={24} className="text-black" />
    </button>
  );
};