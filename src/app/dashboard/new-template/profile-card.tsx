import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, ExternalLink } from "lucide-react";

interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  currentCompany: string;
  profilePhotoUrl: string;
  profileUrl: string;
}

interface ProfileCardProps {
  profile: LinkedInProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  // Default profile for demonstration
  const defaultProfile: LinkedInProfile = {
    name: "Thathva Reddy",
    headline: "Founding Engineer @ Kato",
    location: "San Francisco Bay Area",
    currentCompany: "Kato",
    profilePhotoUrl:
      "https://media.licdn.com/dms/image/v2/D5603AQE7ScwL72_fxQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1698513694226?e=1747872000&v=beta&t=vtB3AzQHttWCKvOdboSSTiF1n80KqGGExqvuql9gStc",
    profileUrl:
      "https://www.linkedin.com/in/thathva-reddy?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAACXUfKwBikMzWK8SuZsqHvYT-DCypJC6Bvk",
  };

  // Use provided profile or default
  const data = profile || defaultProfile;

  // Create initials for avatar fallback
  const initials = data.name
    ? data.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  return (
    <Card className="py-2 w-full overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
      <CardContent className="p-2">
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-row justify-start gap-2">
            <Avatar className="h-8 w-8 border border-border">
              {data.profilePhotoUrl ? (
                <AvatarImage
                  src={data.profilePhotoUrl}
                  alt={data.name || "Profile"}
                />
              ) : null}
              <AvatarFallback className="bg-muted text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              {data.name && (
                <h3 className="font-semibold text-sm leading-none">
                  {data.name}
                </h3>
              )}
              {data.headline && (
                <p className="text-sm text-muted-foreground">{data.headline}</p>
              )}

              <div className="flex flex-row gap-1.5 mt-3">
                {data.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{data.location}</span>
                  </div>
                )}

                {data.currentCompany && (
                  <div className="flex items-center gap-2">
                    <p>|</p>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{data.currentCompany}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {data.profileUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
