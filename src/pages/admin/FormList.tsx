import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Icon from "../../components/Icon";
import { forms } from "../../data/mockData";

const FormList: React.FC = () => {
  const [formsList, setFormsList] = useState(forms);

  const handleDeleteForm = (id: string) => {
    // In a real application, this would make an API call
    setFormsList(formsList.filter((form) => form.id !== id));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Forms</h1>
          <Link to="/admin/forms/create">
            <Button>Create New Form</Button>
          </Link>
        </div>

        <div className="mt-6">
          {formsList.length === 0 ? (
            <Card>
              <div className="text-center py-4">
                <p className="text-gray-500">
                  No forms found. Create your first form!
                </p>
              </div>
            </Card>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Form Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Questions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formsList.map((form) => (
                    <tr key={form.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {form.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {form.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {form.questions.length} questions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(form.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/admin/forms/${form.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Icon icon="FaEye" className="inline mr-1" /> View
                        </Link>
                        <Link
                          to={`/admin/forms/${form.id}/edit`}
                          className="ml-2 text-indigo-600 hover:text-indigo-900"
                        >
                          <Icon icon="FaEdit" className="inline mr-1" /> Edit
                        </Link>
                        <Link
                          to={`/admin/forms/${form.id}/assign`}
                          className="ml-2 text-green-600 hover:text-green-900"
                        >
                          <Icon icon="FaUserPlus" className="inline mr-1" />{" "}
                          Assign
                        </Link>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          <Icon icon="FaTrashAlt" className="inline mr-1" />{" "}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormList;
