import { useState, useEffect } from "react";
import { Select } from "react-select";
import { Modal } from "bootstrap";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './../assets/style.css'
import chroma from 'chroma-js';
import { categoryOptions } from "./../data.ts";
import { statusOptions } from "./../data.ts";



export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStatuss, setSelectedStatuss] = useState();
    const [successMessage, setSuccessMessage] = useState("");
    const [holdCount, setHoldCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 3; // Number of jobs to display per page
    const [joblistData, setJoblistData] = useState([]); // Store joblist data



    // Function to fetch jobsite
    function getJobs() {
        fetch("http://localhost:3030/jobsite")
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error();
            })
            .then((data) => {
                setJobs(data);
                // Count jobsite by status
                const hold = data.filter(job => job.status === "On Hold").length;
                const inProgress = data.filter(job => job.status === "In progress").length;
                const completed = data.filter(job => job.status === "Completed").length;

                setHoldCount(hold);
                setInProgressCount(inProgress);
                setCompletedCount(completed);
            })
            .catch((error) => {
                console.error("Error fetching jobs:", error);
                alert("Unable to get the data");
            });
    }

    // Function to fetch joblist data
    function getJoblist() {
        fetch("http://localhost:3030/joblist")
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error();
            })
            .then((data) => {
                setJoblistData(data);
            })
            .catch((error) => {
                console.error("Error fetching joblist:", error);
            });
    }


    useEffect(() => {
        getJobs();
        getJoblist();
    }, []);

    // Function to load previous values when modal opens
    const loadPreviousValues = (jobId) => {
        const existingJob = joblistData.find((job) => job.id === jobId);
        if (existingJob) {
            setQuantity(existingJob.quantity || '');
            setDescription(existingJob.description || '');
            setNotes(existingJob.notes || '');
        } else {
            setQuantity('');
            setDescription('');
            setNotes('');
        }
    };

    //Function to create the new jobsite
    async function handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const job = Object.fromEntries(formData.entries());


        if (!job.title || !selectedStatuss || selectedCategories.length === 0) {
            alert("Please fill all the fields!");
            return;
        }

        const jobData = {
            ...job,
            category: selectedCategories.map((item) => item.value),
            status: selectedStatuss.value,
        };

        try {
            const response = await fetch("http://localhost:3030/jobsite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                const newJob = await response.json();
                setJobs((prevJobs) => [...prevJobs, newJob]);

                // Show success message
                setSuccessMessage("Job added successfully!");

                event.target.reset();
                setSelectedCategories([]);
                setSelectedStatuss(null);
                closeModal("createJobModal");


                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else if (response.status === 400) {
                alert("Validation Errors");
            } else {
                alert("Unable to create the job");
            }
        } catch (error) {
            console.error("Error during job creation:", error);
            alert("Unable to connect to the server");
        }
    }
    // Calculate total pages
    const totalPages = Math.ceil(jobs.length / jobsPerPage);


    // Get current jobs for the page
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);


    //Function to update items inside the inventory part
    const handleSubmitEdit = async (e, jobId) => {
        e.preventDefault();
        const updatedJobEntry = {
            id: jobId,
            title: jobs.find((job) => job.id === jobId)?.title,

            quantity,
            description,
            notes,
            categories: jobs.find((job) => job.id === jobId)?.category || [],
        };

        try {

            const response = await fetch('http://localhost:3030/joblist');
            const data = await response.json();

            const existingJob = data.find((job) => job.id === jobId);

            if (existingJob) {
                // If the job exists, update it
                const updateResponse = await fetch(`http://localhost:3030/joblist/${jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedJobEntry),
                });

                if (!updateResponse.ok) {
                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                }

                console.log('Job updated successfully');
            } else {
                const createResponse = await fetch('http://localhost:3030/joblist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedJobEntry),
                });

                if (!createResponse.ok) {
                    throw new Error(`HTTP error! status: ${createResponse.status}`);
                }

                console.log('Job added successfully');
            }

            window.location.href = '/inventory';
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };


    // Function to close the modal using Bootstrap's JavaScript API
    function closeModal() {
        const modalElement = document.querySelector(".modal.show");

        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', () => {
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
            });

            const allModals = document.querySelectorAll('.modal.show');
            allModals.forEach((modal) => {
                const modalInstance = Modal.getInstance(modal) || new Modal(modal);
                modalInstance.hide();
            });

            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }

        // Reset the selected categories and status
        setSelectedCategories([]);
        setSelectedStatuss(null);
        setSuccessMessage("");
        // Clear the title input field
        const titleInput = document.getElementById('title');
        if (titleInput) {
            titleInput.value = '';
        }

        // Additional cleanup for body styles and modals
        setTimeout(() => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);
    }



    const dot = (color = 'transparent') => ({
        alignItems: 'center',
        display: 'flex',

        ':before': {
            backgroundColor: color,
            borderRadius: 10,
            content: '" "',
            display: 'block',
            marginRight: 8,
            height: 10,
            width: 10,
        },
    });

    const colourStyles = {
        control: (styles) => ({ ...styles, backgroundColor: 'white' }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                        ? data.color
                        : isFocused
                            ? color.alpha(0.3).css()
                            : undefined,
                color: isDisabled
                    ? '#ccc'
                    : isSelected
                        ? 'white' 
                        : 'black', 
                cursor: isDisabled ? 'not-allowed' : 'default',

                ':hover': {
                    ...styles[':hover'],
                    backgroundColor: isDisabled
                        ? undefined
                        : isFocused
                            ? color.alpha(1).css() 
                            : undefined,
                    color: 'white', 
                },

                ':active': {
                    ...styles[':active'],
                    backgroundColor: isDisabled
                        ? undefined
                        : isSelected
                            ? color.alpha(1).css() 
                            : color.alpha(0.3).css(), 
                    color: 'white', 
                },
            };
        },
        multiValue: (styles, { data }) => {
            return {
                ...styles,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            ...dot(data.color)
        }),
        multiValueRemove: (styles, { data }) => ({
            ...styles,
            backgroundColor: 'red',
            padding: '2px',
            color: 'white',
            ':hover': {
                backgroundColor: 'darkred',
                color: 'white',
            },
        }),
        singleValue: (styles, { data, isSelected }) => {

            return {
                ...styles,
                display: 'flex',
                alignItems: 'center',
                ...(isSelected ? dot(data.color) : {}),
            };
        },
    };
    const colourStatusStyles = {
        control: styles => ({ ...styles, backgroundColor: "white" }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data.color)
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                        ? data.color
                        : isFocused
                            ? color.alpha(0.1).css()
                            : undefined,
                color: isDisabled
                    ? "#ccc"
                    : isSelected
                        ? chroma.contrast(color, "white") > 2
                            ? "white"
                            : "black"
                        : data.color,
                cursor: isDisabled ? "not-allowed" : "default",

                ":active": {
                    ...styles[":active"],
                    backgroundColor: !isDisabled
                        ? isSelected
                            ? data.color
                            : color.alpha(0.3).css()
                        : undefined
                }
            }
        },
        input: styles => ({ ...styles, ...dot() }),
        placeholder: styles => ({ ...styles, ...dot("#ccc") }),
        singleValue: (styles, { data }) => {
            return {
                ...styles,
                display: 'flex',
                alignItems: 'center',
                ':before': {
                    content: '" "',
                    backgroundColor: data.color + " !important",
                    borderRadius: '50%',
                    width: 10,
                    height: 10,
                    marginRight: 8,
                },
            };
        },

    }


    return (
        <div className="container-fluid my-4">
            <div className="row">
                <div className="col-4 p-1">
                    <div className="count-onhold text-center count-text">
                        {holdCount} On Hold
                    </div>
                </div>
                <div className="col-4 p-1">
                    <div className="count-inprogress text-center count-text">
                        {inProgressCount} In Progress
                    </div>
                </div>
                <div className="col-4 p-1">
                    <div className="count-completed text-center count-text">
                        {completedCount} Completed
                    </div>

                </div>
            </div>
            {successMessage && (
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            )}
            <div className="jobsite text-center">
                <div className="row mb-3" >
                    <div className="col text-end">
                        <button
                            type="button"
                            className="btn create-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#createJobModal1"
                        >
                            Create <i class="bi bi-plus-lg"></i>
                        </button>
                        {/* Create Jobsite Modal  */}
                        <div className="modal fade" id="createJobModal1" tabIndex="-1" aria-labelledby="createJobModalLabel1" aria-hidden="true">
                            <div className="modal-dialog text-start">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="createJobModalLabel1">
                                            Create New Jobsite
                                        </h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
                                    </div>
                                    <div className="modal-body text-start">
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">
                                                <div className="col-12">
                                                    <label htmlFor="title" className="form-label">Jobsite Name</label>
                                                    <input type="text" className="form-control" id="title" name="title" required />
                                                </div>
                                                <div className="col-7">
                                                    <label htmlFor="category" className="form-label">Category included</label>
                                                    <Select
                                                        closeMenuOnSelect={false}
                                                        isMulti
                                                        options={categoryOptions}
                                                        value={selectedCategories}
                                                        onChange={setSelectedCategories}
                                                        styles={colourStyles}
                                                    />
                                                </div>
                                                <div className="col-5">
                                                    <label htmlFor="status" className="form-label">Status</label>
                                                    <Select
                                                        options={statusOptions}
                                                        value={selectedStatuss}
                                                        onChange={setSelectedStatuss}
                                                        styles={colourStatusStyles}
                                                    />
                                                </div>
                                            </div>

                                            <div className="modal-footer border-0">
                                                <button type="button" className="btn cancel-btn" data-bs-dismiss="modal" onClick={closeModal}>
                                                    Cancel  <i class="bi bi-x"></i>
                                                </button>
                                                <button type="submit" className="btn create-btn">Create  <i class="bi bi-check2"></i></button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="table-responsive mt-2 text-center">
                        <table className="table table-borderless table-striped">
                            <thead className="background:white text-center">
                                <tr>
                                    <th className="table-title text-center">Jobsite Name</th>
                                    <th className="table-title text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn jobsite-title"
                                                data-bs-toggle="modal"
                                                data-bs-target={`#exampleModal${job.id}`}
                                                onClick={() => loadPreviousValues(job.id)}
                                            >
                                                {job.title}
                                            </button>
                                            {/* Edit Jobsite Modal */}
                                            <div className="modal fade" id={`exampleModal${job.id}`} tabIndex="-1" aria-labelledby={`exampleModalLabel${job.id}`} aria-hidden="true">
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h1 className="modal-title fs-5" id={`exampleModalLabel${job.id}`}>
                                                                Edit Job
                                                            </h1>
                                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div className="modal-body text-start">
                                                            <form onSubmit={(e) => handleSubmitEdit(e, job.id)}>
                                                                <div className="row">
                                                                    <div className="col-6">
                                                                        <label htmlFor={`title${job.id}`} className="form-label">
                                                                            Title
                                                                        </label>
                                                                        <input type="text" className="form-control" id={`title${job.id}`} name="title" value={job.title} disabled />
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <label htmlFor={`quantity${job.id}`} className="form-label">
                                                                            Quantity
                                                                        </label>
                                                                        <input type="number" className="form-control" id={`quantity${job.id}`} name="quantity" value={quantity} required onChange={(e) => setQuantity(e.target.value)} />
                                                                    </div>
                                                                    <div className="col-12">
                                                                        <label htmlFor={`description${job.id}`} className="form-label">
                                                                            Description
                                                                        </label>
                                                                        <textarea className="form-control" id={`description${job.id}`} name="description" value={description} required onChange={(e) => setDescription(e.target.value)}></textarea>
                                                                    </div>
                                                                    <div className="col-12">
                                                                        <label htmlFor={`notes${job.id}`} className="form-label">
                                                                            Notes
                                                                        </label>
                                                                        <textarea className="form-control" id={`notes${job.id}`} name="notes" value={notes} required onChange={(e) => setNotes(e.target.value)}></textarea>
                                                                    </div>
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button type="submit" className="btn create-btn">
                                                                        Save changes
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${job.status === "In progress" ? "badge-in-progress" : job.status === "Completed" ? "badge-completed" : job.status === "On Hold" ? "badge-on-hold" : ""}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination d-flex justify-content-end">
                            <button class="prev-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button class="next-btn"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
