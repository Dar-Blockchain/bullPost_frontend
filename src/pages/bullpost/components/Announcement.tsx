import React, { useEffect } from "react";
import { TextField, useTheme, useMediaQuery, Typography, Box, Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";

interface AnnouncementProps {
  text: string;
  setText: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  _id: string;
}

const Announcement: React.FC<AnnouncementProps> = ({ text, setText, inputRef, _id }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { user } = useAuth();

  const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);

  useEffect(() => {
    if (selectedAnnouncement && selectedAnnouncement.length > 0) {
      setText(selectedAnnouncement[0].prompt);
    }
  }, [selectedAnnouncement, setText]);

  const dispatch = useDispatch<AppDispatch>();

  const postId = selectedAnnouncement && selectedAnnouncement.length > 0
    ? selectedAnnouncement[0]._id
    : _id;

  // Calculate the word count
  const wordCount = text && text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <>
      {/* Start instead of "hi" */}
      {selectedAnnouncement && selectedAnnouncement.length > 0 && !isMobile && <>
        <Typography

          variant="caption"
          sx={{
            mt: "-22px",
            ml: "10px",

            fontSize: "12px",
            color: "#A6A6A6",
            textAlign: "start", // Align text to the left (start)
            width: "100%", // Ensure it spans the full width to align the text properly
          }}
        >
          Last edited : {dayjs(selectedAnnouncement[0].createdAt).format("MMM DD, YYYY")}
        </Typography>
        < Typography
          variant="caption"
          sx={{
            fontSize: "12px",
            color: "#A6A6A6",
            ml: "10px",
            textAlign: "start", // Align text to the left (start)
            width: "100%", // Ensure it spans the full width to align the text properly
          }}
        >
          Word Count: {wordCount}
        </Typography >

      </>}
      {
        user && !isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              width: isMobile ? "100%" : "52%",
            }}
          >
            <Avatar
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user?.user_image}`}
              sx={{ width: 25, height: 25 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
              <Box>
                <Typography sx={{
                  color: "#A6A6A6", // Text color
                  fontFamily: "Sora, sans-serif", // Apply Sora font
                  fontWeight: 400, // Font weight 400 (Regular)
                  fontSize: "12px", // Font size 14px
                  lineHeight: "24px", // Line height 24px
                  letterSpacing: "0%", // Letter spacing 0%
                }}>
                  {user && user.userName}
                </Typography>
              </Box>
            </Box>
          </Box>
        )
      }
      <Typography
        variant="caption"
        sx={{
          mb: 1,
          mt: isMobile ? "20px" : "0",
          color: "grey",
          textAlign: "start",
          width: isMobile ? "100%" : "50%",
          
        }}
      >
        {postId ? "Your post is saved" : "Your post is not saved"}
      </Typography>

      {/* Word Count Display */}


      <TextField
        fullWidth
        multiline
        rows={isMobile ? 6 : 4}
        variant="outlined"
        placeholder="Write your announcement..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        inputRef={inputRef}
        sx={{
          mt: isMobile ? "10px" : "0",
          width: isMobile ? "100%" : "50%",
          textarea: {
            color: "#fff",
            textAlign: "start",
            fontSize: "14px",
            resize: "vertical", // Enable vertical resizing by the user
          },
          "& .MuiOutlinedInput-input": {
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FFB300",
              borderRadius: "3px",
            },
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": { borderColor: "#333" },
            "&:hover fieldset": { borderColor: "#444" },
          },
        }}
      />
    </>
  );
};

export default Announcement;
