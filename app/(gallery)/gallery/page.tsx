import Wall from "@/components/gallery/wall";
import { getContact, getWorks } from "@/lib/gallery";

export default function GalleryPage() {
  return <Wall works={getWorks()} contact={getContact()} initialSlug={null} />;
}
