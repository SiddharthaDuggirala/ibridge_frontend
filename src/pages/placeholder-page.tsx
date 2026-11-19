import {PageHeader} from "@/components/page-header";

export function PlaceholderPage({title}:{title:string}){

    return(
        <>
            <PageHeader title={title} description= "This page has not been built yet." />
            <p className="text-sm text-muted-foreground">Coming soon...</p>
        </>
    );
}