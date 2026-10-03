import LandmarkForm from "../../LandmarkForm";

export default function EditLandmarkPage({ params }: { params: { id: string } }) {
  return <LandmarkForm id={params.id} />;
}
