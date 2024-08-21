import { useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDropdownMenu } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteSection,
  deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import ConfirmationModal from "../../../../Common/ConfirmationModal";
import SubSectionModal from "./SubSectionModal";

export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // State management for modal operations
  const [modalState, setModalState] = useState({
    addSubSection: null,
    viewSubSection: null,
    editSubSection: null,
    confirmationModal: null,
  });

  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection({
      sectionId,
      courseId: course._id,
      token,
    });
    if (result) {
      dispatch(setCourse(result));
    }
    setModalState((prev) => ({ ...prev, confirmationModal: null }));
  };

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, token });
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setModalState((prev) => ({ ...prev, confirmationModal: null }));
  };

  const handleSetConfirmationModal = (config) => {
    setModalState((prev) => ({ ...prev, confirmationModal: config }));
  };

  return (
    <>
      <div className="rounded-lg bg-richblack-700 p-6 px-8" id="nestedViewContainer">
        {course?.courseContent?.map((section) => (
          <details key={section._id} open>
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <p className="font-semibold text-richblack-50">{section.sectionName}</p>
              </div>
              <div className="flex items-center gap-x-3">
                <button
                  onClick={() =>
                    handleChangeEditSectionName(section._id, section.sectionName)
                  }
                >
                  <MdEdit className="text-xl text-richblack-300" />
                </button>
                <button
                  onClick={() =>
                    handleSetConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleteSection(section._id),
                      btn2Handler: () => handleSetConfirmationModal(null),
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                <span className="font-medium text-richblack-300">|</span>
                <AiFillCaretDown className="text-xl text-richblack-300" />
              </div>
            </summary>
            <div className="px-6 pb-4">
              {section.subSection.map((data) => (
                <div
                  key={data?._id}
                  onClick={() => setModalState((prev) => ({ ...prev, viewSubSection: data }))}
                  className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                >
                  <div className="flex items-center gap-x-3 py-2 ">
                    <RxDropdownMenu className="text-2xl text-richblack-50" />
                    <p className="font-semibold text-richblack-50">{data.title}</p>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    <button
                      onClick={() =>
                        setModalState((prev) => ({
                          ...prev,
                          editSubSection: { ...data, sectionId: section._id },
                        }))
                      }
                    >
                      <MdEdit className="text-xl text-richblack-300" />
                    </button>
                    <button
                      onClick={() =>
                        handleSetConfirmationModal({
                          text1: "Delete this Sub-Section?",
                          text2: "This lecture will be deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteSubSection(data._id, section._id),
                          btn2Handler: () => handleSetConfirmationModal(null),
                        })
                      }
                    >
                      <RiDeleteBin6Line className="text-xl text-richblack-300" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setModalState((prev) => ({ ...prev, addSubSection: section._id }))}
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>
            </div>
          </details>
        ))}
      </div>

      {modalState.addSubSection && (
        <SubSectionModal
          modalData={modalState.addSubSection}
          setModalData={(data) => setModalState((prev) => ({ ...prev, addSubSection: data }))}
          add
        />
      )}
      {modalState.viewSubSection && (
        <SubSectionModal
          modalData={modalState.viewSubSection}
          setModalData={(data) => setModalState((prev) => ({ ...prev, viewSubSection: data }))}
          view
        />
      )}
      {modalState.editSubSection && (
        <SubSectionModal
          modalData={modalState.editSubSection}
          setModalData={(data) => setModalState((prev) => ({ ...prev, editSubSection: data }))}
          edit
        />
      )}

      {modalState.confirmationModal && (
        <ConfirmationModal modalData={modalState.confirmationModal} />
      )}
    </>
  );
}
