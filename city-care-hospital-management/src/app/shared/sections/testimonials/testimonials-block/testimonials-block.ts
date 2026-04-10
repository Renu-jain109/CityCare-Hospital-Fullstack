import { Component } from '@angular/core';
import { TestimonialsCard } from "../testimonials-card/testimonials-card";
import { CommonModule } from '@angular/common';
import { TestimonialsCardInterface } from '../../interfaces/testimonials-card-interface';
@Component({
    selector: 'app-testimonials-block',
    standalone: true,
    imports: [TestimonialsCard, CommonModule],
    templateUrl: './testimonials-block.html',
    styleUrl: './testimonials-block.css',
})
export class TestimonialsBlock {
    public cardData: TestimonialsCardInterface[] = [
        {
            name: "Priya Sharma",
            message: "Best hospital in the city! Doctor was very caring and staff was extremely helpful. My mother got discharged in just 3 days.",
            image: "/assets/person-images/priya-sharma.jpg"
        },
        {
            name: "Rahul Verma",
            message: "Excellent service. The doctors listened carefully and the treatment was quick and smooth. Highly professional team.",
            image: "/assets/person-images/rahul-verma.jpg"
        },
        {
            name: "Sneha Patel",
            message: "Clean hospital, modern equipment and very supportive nurses. My surgery went perfectly. Highly recommended!",
            image: "/assets/person-images/sneha-patel.jpg"
        },
        {
            name: "Amit Kumar",
            message: "I came late at night in an emergency and got immediate attention. The doctor and staff saved my wife’s life. Thank you.",
            image: "/assets/person-images/amit-kumar.jpg"
        },
        {
            name: "Neha Singh",
            message: "My delivery happened here. It was the best experience. The nurses were very caring and the doctor explained every step. 10/10!",
            image: "/assets/person-images/neha-singh.jpg"
        },
        {
            name: "Rajesh Gupta",
            message: "I came for a heart checkup. I received the reports within 2 hours and the doctor gave me full time. Very satisfied.",
            image: "/assets/person-images/rajesh-gupta.jpg"
        }
    ]
}


