export interface CardInterface {

    /* Background and main wrapper */
    bgColor?: string;
    customClass?: string;

    /* ICON AREA */
    iconClass?: string;
    iconColor?: string;
    iconSize?: string;

    /* Show circle around icon? */
    showIconCircle?: boolean;

    /* Circle background */
    iconBgColor?: string;

    /* Title */
    title?: string;
    titleClass?: string;

    /* Description */
    description?: string;
    descriptionClass?: string;
    showDescriptionOnHover?: boolean;
    
    /* Hover wrapper (optional) */
    hoverClass?: string;
    valueClass?: string;
    value?: string;
    
    department?: string;
    deparmentClass?: string;
    
    experience?: string;
    experienceClass?: string;
    
    qualification?: string;
    qualificationClass?: string;
    
    availability?: string;
    availabilityClass?: string;
    
    /* IMAGE AREA (New) */
    imageSrc?: string;
    imageClass?: string;
    fallbackText?: string;
    fallbackBg?: string;
    routerLink?: string;

}
