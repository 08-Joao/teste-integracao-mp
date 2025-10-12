import backendRoute from "./httpClient";
import { SignupPatientDto } from "@/models/dtos/signup-patient.dto";
import { SigninPatientDto } from "@/models/dtos/signin-patient.dto";
import { SignupDoctorDto } from "@/models/dtos/signup-doctor.dto";
import { SigninDoctorDto } from "@/models/dtos/signin-doctor.dto";
import { CreateUserDto } from "@/models/dtos/create-user.dto";
import { UpdateUserDto } from "@/models/dtos/update-user.dto";
import { CreateAccountDto } from "@/models/dtos/create-account.dto";
import { UpdateAccountDto } from "@/models/dtos/update-account.dto";
import { CreateActivityDto } from "@/models/dtos/create-activity.dto";
import { UpdateActivityDto } from "@/models/dtos/update-activity.dto";
import { CreateAppointmentDto } from "@/models/dtos/create-appointment.dto";
import { UpdateAppointmentDto } from "@/models/dtos/update-appointment.dto";
import { CreateOnCallRequestDto, CreateOnCallProposalDto } from "@/models/dtos/create-on-call.dto";
import { UpdateOnCallRequestDto, UpdateOnCallProposalDto } from "@/models/dtos/update-on-call.dto";
import { CreateReviewDto } from "@/models/dtos/create-review.dto";
import { UpdateReviewDto } from "@/models/dtos/update-review.dto";
import { CreateSpecialtyDto } from "@/models/dtos/create-specialty.dto";
import { UpdateSpecialtyDto } from "@/models/dtos/update-specialty.dto";
import { CreatePracticeLocationDto, UpdatePracticeLocationDto } from "@/models/dtos/practice-location.dto";
import { CreateActivityDoctorDto, UpdateActivityDoctorDto } from "@/models/dtos/activity-doctor.dto";
import { CreateActivityDoctorLocationDto, UpdateActivityDoctorLocationDto } from "@/models/dtos/activity-doctor-location.dto";

const Api = {
    getMe: async function () {
        try {
            const response = await backendRoute.get('/auth/me', { withCredentials: true })
            return response
        } catch(e) {
            console.log(e)
        }
    },
    signout: async function () {
        try {
            const response = await backendRoute.post('/auth/signout', {}, { withCredentials: true })

            return response
        } catch(e) {
            console.log(e)
        }
    },
    // Auth routes - Patient
    signupPatient: async function (data: SignupPatientDto) {
        try {
            const response = await backendRoute.post('/auth/patient/signup',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    signinPatient: async function (data: SigninPatientDto) {
        try {
            const response = await backendRoute.post('/auth/patient/signin',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Auth routes - Doctor
    signupDoctor: async function (data: SignupDoctorDto) {
        try {
            const response = await backendRoute.post('/auth/doctor/signup',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    signinDoctor: async function (data: SigninDoctorDto) {
        try {
            const response = await backendRoute.post('/auth/doctor/signin',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Users routes
    createUser: async function (data: CreateUserDto) {
        try {
            const response = await backendRoute.post('/users',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllUsers: async function () {
        try {
            const response = await backendRoute.get('/users', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getUserById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/users/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateUser: async function (id: string, data: UpdateUserDto) {
        try {
            const response = await backendRoute.patch(`/users/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteUser: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/users/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Accounts routes
    createAccount: async function (data: CreateAccountDto) {
        try {
            const response = await backendRoute.post('/accounts',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllAccounts: async function () {
        try {
            const response = await backendRoute.get('/accounts', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAccountById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/accounts/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateAccount: async function (id: string, data: UpdateAccountDto) {
        try {
            const response = await backendRoute.patch(`/accounts/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteAccount: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/accounts/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Activities routes
    createActivity: async function (data: CreateActivityDto) {
        try {
            const response = await backendRoute.post('/activities',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllActivities: async function () {
        try {
            const response = await backendRoute.get('/activities', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getActivityById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/activities/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateActivity: async function (id: string, data: UpdateActivityDto) {
        try {
            const response = await backendRoute.patch(`/activities/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteActivity: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/activities/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Appointments routes
    createAppointment: async function (data: CreateAppointmentDto) {
        try {
            const response = await backendRoute.post('/appointments',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllAppointments: async function () {
        try {
            const response = await backendRoute.get('/appointments', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAppointmentById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/appointments/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateAppointment: async function (id: string, data: UpdateAppointmentDto) {
        try {
            const response = await backendRoute.patch(`/appointments/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteAppointment: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/appointments/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // On-Call routes
    createOnCallRequest: async function (data: CreateOnCallRequestDto) {
        try {
            console.log('API: Sending request to /on-call/request with data:', data);
            const response = await backendRoute.post('/on-call/request',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            console.log('API: Response received:', response);
            return response
        } catch (e: any) {
            console.error('API: Error creating on-call request:', e);
            console.error('API: Error response:', e.response?.data);
            throw e;
        }
    },
    createOnCallProposal: async function (data: CreateOnCallProposalDto) {
        try {
            const response = await backendRoute.post('/on-call/proposal',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllOnCalls: async function () {
        try {
            const response = await backendRoute.get('/on-call', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getOnCallRequestById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/on-call/request/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getOnCallProposalById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/on-call/proposal/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateOnCallRequest: async function (id: string, data: UpdateOnCallRequestDto) {
        try {
            const response = await backendRoute.patch(`/on-call/request/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateOnCallProposal: async function (id: string, data: UpdateOnCallProposalDto) {
        try {
            const response = await backendRoute.patch(`/on-call/proposal/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteOnCallRequest: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/on-call/request/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteOnCallProposal: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/on-call/proposal/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Reviews routes
    createReview: async function (data: CreateReviewDto) {
        try {
            const response = await backendRoute.post('/reviews',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllReviews: async function () {
        try {
            const response = await backendRoute.get('/reviews', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getReviewById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/reviews/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateReview: async function (id: string, data: UpdateReviewDto) {
        try {
            const response = await backendRoute.patch(`/reviews/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteReview: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/reviews/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Specialties routes
    createSpecialty: async function (data: CreateSpecialtyDto) {
        try {
            const response = await backendRoute.post('/specialties',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getAllSpecialties: async function () {
        try {
            const response = await backendRoute.get('/specialties', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getSpecialtyById: async function (id: string) {
        try {
            const response = await backendRoute.get(`/specialties/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    updateSpecialty: async function (id: string, data: UpdateSpecialtyDto) {
        try {
            const response = await backendRoute.patch(`/specialties/${id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    deleteSpecialty: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/specialties/${id}`, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Practice Locations
    createPracticeLocation: async function (data: CreatePracticeLocationDto) {
        try {
            const response = await backendRoute.post('/practice-locations', data, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getPracticeLocations: async function (doctorProfileId?: string) {
        try {
            const url = doctorProfileId ? `/practice-locations?doctorProfileId=${doctorProfileId}` : '/practice-locations'
            const response = await backendRoute.get(url, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Activity Doctors
    createActivityDoctor: async function (data: CreateActivityDoctorDto) {
        try {
            const response = await backendRoute.post('/activity-doctors', data, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getActivityDoctors: async function (doctorProfileId?: string) {
        try {
            const url = doctorProfileId ? `/activity-doctors?doctorProfileId=${doctorProfileId}` : '/activity-doctors'
            const response = await backendRoute.get(url, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Activity Doctor Locations
    createActivityDoctorLocation: async function (data: CreateActivityDoctorLocationDto) {
        try {
            const response = await backendRoute.post('/activity-doctor-locations', data, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getActivityDoctorLocations: async function (doctorProfileId?: string) {
        try {
            const url = doctorProfileId ? `/activity-doctor-locations?doctorProfileId=${doctorProfileId}` : '/activity-doctor-locations'
            const response = await backendRoute.get(url, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // On-Call - Novos endpoints
    getOpenOnCallRequests: async function () {
        try {
            const response = await backendRoute.get('/on-call/requests/open', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getClosedOnCallRequests: async function () {
        try {
            const response = await backendRoute.get('/on-call/requests/closed', { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    getPatientOnCallRequests: async function (patientAccountId: string, status?: string) {
        try {
            const url = status 
                ? `/on-call/requests/patient/${patientAccountId}?status=${status}`
                : `/on-call/requests/patient/${patientAccountId}`
            const response = await backendRoute.get(url, { withCredentials: true })
            return response
        } catch (e) {
            console.log(e)
        }
    },
    acceptOnCallProposal: async function (proposalId: string, patientAccountId: string) {
        try {
            const response = await backendRoute.post(`/on-call/proposal/${proposalId}/accept`, 
                { patientAccountId }, 
                { withCredentials: true }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    rejectOnCallProposal: async function (proposalId: string, patientAccountId: string) {
        try {
            const response = await backendRoute.post(`/on-call/proposal/${proposalId}/reject`, 
                { patientAccountId }, 
                { withCredentials: true }
            )
            return response
        } catch (e) {
            console.log(e)
        }
    },
    // Novas funções simplificadas
    acceptProposal: async function (proposalId: string, selectedTime: string) {
        try {
            const response = await backendRoute.post(`/on-call/proposal/${proposalId}/accept`, 
                { selectedTime }, 
                { withCredentials: true }
            )
            return response
        } catch (e: any) {
            console.error('Error accepting proposal:', e);
            throw e;
        }
    },
    rejectProposal: async function (proposalId: string) {
        try {
            const response = await backendRoute.post(`/on-call/proposal/${proposalId}/reject`, 
                {}, 
                { withCredentials: true }
            )
            return response
        } catch (e: any) {
            console.error('Error rejecting proposal:', e);
            throw e;
        }
    },
}

export default Api