<template>
    <div class="mb-6">
        <div class="flex justify-between w-full relative">
            <!-- Lignes de connexion en arrière-plan -->
            <div class="absolute top-6 h-1 bg-gray-200 z-0" style="left: calc(50px + 6px); right: calc(50px + 6px);">
                <div 
                    class="h-full transition-all duration-300" 
                    :class="progressBarColor"
                    :style="{ width: progressWidth }"
                ></div>
            </div>
            
            <!-- Pastilles et textes -->
            <div 
                v-for="(step, index) in steps" 
                :key="index" 
                class="flex flex-col items-center z-10"
            >
                <button 
                    @click="handleStepClick(index)"
                    :class="[
                        'w-12 h-12 rounded-full flex items-center justify-center text-base font-medium transition-all duration-200',
                        getStepClasses(index)
                    ]"
                    :disabled="disableInactive && !canNavigateToStep(index)"
                >
                    <span v-if="isStepCompleted(index)" class="text-white">✓</span>
                    <span v-else>{{ index + 1 }}</span>
                </button>
                <div 
                    class="mt-2 text-sm transition-colors duration-200" 
                    :class="[
                        currentStep === index ? `font-semibold ${activeTextColor}` : 'text-gray-600'
                    ]"
                >
                    {{ step.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface Step {
    name: string;
    isValid?: () => boolean;
}

const props = defineProps({
    steps: {
        type: Array as () => Step[],
        required: true
    },
    currentStep: {
        type: Number,
        default: 0
    },
    disableInactive: {
        type: Boolean,
        default: true
    },
    activeColor: {
        type: String,
        default: 'indigo'
    },
    completedColor: {
        type: String,
        default: 'green'
    },
    validateBeforeChange: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:currentStep', 'step-click']);

// Couleurs configurables
const activeColorClass = computed(() => `bg-${props.activeColor}-600`);
const completedColorClass = computed(() => `bg-${props.completedColor}-500`);
const activeTextColor = computed(() => `text-${props.activeColor}-600`);

// Couleur de la barre de progression
const progressBarColor = computed(() => 
    props.activeColor === 'indigo' ? 'bg-indigo-600' : 
    props.activeColor === 'green' ? 'bg-green-500' : 
    `bg-${props.activeColor}-500`
);

// Calcul de la largeur de progression
const progressWidth = computed(() => {
    const totalSteps = props.steps.length;
    if (totalSteps <= 1) return '0%';
    
    const segments = totalSteps - 1;
    const progress = Math.min(props.currentStep, segments);
    
    return `${(progress / segments) * 100}%`;
});

// Vérifier si une étape est valide
function isStepValid(index: number): boolean {
    const step = props.steps[index];
    return typeof step.isValid === 'function' ? step.isValid() : true;
}

// Vérifier si une étape est complétée
function isStepCompleted(index: number): boolean {
    return index < props.currentStep && isStepValid(index);
}

// Vérifier si l'utilisateur peut naviguer vers une étape
function canNavigateToStep(index: number): boolean {
    if (index === props.currentStep) return true;
    if (index > props.currentStep) return false;
    
    // Pour les étapes précédentes, vérifier que toutes les étapes entre sont valides
    for (let i = index; i < props.currentStep; i++) {
        if (!isStepValid(i)) return false;
    }
    
    return true;
}

// Obtenir les classes CSS pour une étape
function getStepClasses(index: number): string {
    if (props.currentStep === index) {
        return `${activeColorClass.value} text-white`;
    } else if (isStepCompleted(index)) {
        return `${completedColorClass.value} text-white`;
    } else {
        return 'bg-gray-200 text-gray-700';
    }
}

// Gérer le clic sur une étape
function handleStepClick(index: number) {
    if (props.disableInactive && !canNavigateToStep(index)) {
        return;
    }
    
    if (props.validateBeforeChange && index > props.currentStep) {
        for (let i = props.currentStep; i < index; i++) {
            if (!isStepValid(i)) {
                return;
            }
        }
    }
    
    emit('update:currentStep', index);
    emit('step-click', index);
}
</script> 