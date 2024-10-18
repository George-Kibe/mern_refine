import { connectDB } from "@/db/connectDB";
import { propertyAddedSuccessEmail, sendVerificationEmail } from "@/lib/emails";
import Property from "@/models/PropertyModel";
import { NextResponse } from "next/server";

// create a property
export const POST = async (request) => {
    const {property} = await request.json();
    if (!property.title) {
        return new NextResponse("Please enter all fields", {status: 422})
    }
    await connectDB();    
    try {
        const newProperty = new Property({
            ...property
        });  
        // TO DO: send email to user
        const savedProperty = await newProperty.save();      
        // await propertyAddedSuccessEmail(email, property);
        return NextResponse.json(
            { message: 'Property created successfully', 
              success: true,
              savedProperty
            },
            { status: 201 }
        )
    } catch (error) {
        return new NextResponse(error.message, {status: 500,})
    }
}

// get all properties
export const GET = async (request) => {
    // get type
    const params = new URLSearchParams(request.url.split('?')[1]);
    const type = params.get("type")
    await connectDB();
    try {
        // check if user already exists using email to avoid duplicates
        if (type){
            const properties = await Property.find({type}).limit(10);
            if (!properties.length) {
                return new NextResponse(`Properties of type ${type} not found`, {status: 404})
            }
            return NextResponse.json(
                { success: true, 
                  properties
                },
                {status: 200}
            )
        }
        const properties = await Property.find();

        return NextResponse.json(
            { success: true, 
              properties
            },
            {status: 200}
        )
    } catch (error) {
        return new NextResponse(error.message, {status: 500,})
    }
}

// update property details
export const PUT = async (request) => {
    const body = await request.json();
    const {_id, updatedProperty} = body;
    try {
      await Property.findOneAndUpdate({_id},{...updatedProperty});
      const property = await Property.find({_id})
      return NextResponse.json(
        { message: 'Property updated successfully', 
          success: true, 
          property
        }, 
        { status: 200 }
      );
    } catch (error) {
      console.log('Property Updating error!');
      return new NextResponse(error.message, {status: 422});
    }
}

// delete a Property
export const DELETE = async (request) => {
    const params = new URLSearchParams(request.url.split('?')[1]);
    const id = params.get("id")
    await connectDB();
    try {
        // perfoem delete action
        const property = await Property.findOneAndDelete({_id: id});
        if (!property) {
            return new NextResponse("Property not found", {status: 404})
        }
        return new NextResponse("Property deleted successfully", {status: 200})
    } catch (error) {
        return new NextResponse(error.message, {status: 500, })
    }
}