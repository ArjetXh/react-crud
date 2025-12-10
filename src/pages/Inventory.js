import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import boximg from './../assets/box.png'; // Replace with the actual path to your image

const Inventory = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredCategory, setFilteredCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 10; // Number of jobs to display per page


    const categories = ['Scaffold', 'Sidewalk Shed', 'Shoring'];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('http://localhost:3030/joblist');
                const data = await response.json();
                setJobs(data);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };

        fetchJobs();
    }, []);

    const handleFilterClick = (category) => {
        setFilteredCategory(category);
        setCurrentPage(1); // Reset to the first page when the category changes
    };

    const filteredJobs = filteredCategory
        ? jobs.filter((job) => (job.category && job.category.includes(filteredCategory)) || (job.categories && job.categories.includes(filteredCategory)))
        : jobs;

    // Calculate total pages
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    // Get current jobs for the page
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    return (
        <div className="inventory-page d-flex">
            <div className="category-buttons d-flex flex-column mb-3">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`btn me-2 w-100 category-${category.toLowerCase().replace(/\s+/g, '-')}${filteredCategory === category ? ' active' : ''}`}
                        onClick={() => handleFilterClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="table-responsive mt-2 ms-2 text-center w-100">
                <table className="table table-borderless table-striped">
                    <thead className="background:white text-center">
                        <tr>
                            <th className="table-title text-center">Jobsite Name</th>
                            <th className="table-title text-center">Quantity</th>
                            <th className="table-title text-center">Description</th>
                            <th className="table-title text-center">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategory && filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    <img src={boximg} alt="No data available" style={{ width: '100px', height: 'auto' }} />
                                    <p>No data available for this category.</p>
                                </td>
                            </tr>
                        ) : (
                            currentJobs.map((job) => (
                                <tr key={job.id}>
                                    <td>
                                        <Link to={`/`} className="jobsite-title">
                                            {job.title}
                                        </Link>
                                    </td>
                                    <td>{job.quantity}</td>
                                    <td>{job.description}</td>
                                    <td>{job.notes}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination d-flex justify-content-end">
                    <button className="prev-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button className="next-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
